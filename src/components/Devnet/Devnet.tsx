import { useEffect, useState } from 'react';
import { getInstance } from '../../fhevmjs';
import './Devnet.css';
import { Eip1193Provider, Provider, ZeroAddress } from 'ethers';
import { ethers } from 'ethers';

import { reencryptEuint64 } from '../../../../hardhat/test/reencrypt.ts';
import { FormProvider, useForm } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form.tsx';
import { Checkbox } from '../ui/checkbox.tsx';
import { InfoModal } from '../Info/InfoModal.tsx';
import { Input } from '../ui/input.tsx';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Button } from '../ui/button.tsx';
import { Progress } from '../ui/progress.tsx';
import { log } from 'node:console';

const toHexString = (bytes: Uint8Array) =>
  '0x' +
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export type DevnetProps = {
  account: string;
  provider: Eip1193Provider;
  readOnlyProvider: Provider;
};

export const Devnet = ({
  account,
  provider,
  readOnlyProvider,
}: DevnetProps) => {
  const [contractAddress, setContractAddress] = useState(ZeroAddress);

  const [handleBalance, setHandleBalance] = useState('0');
  const [decryptedBalance, setDecryptedBalance] = useState('???');

  const [handles, setHandles] = useState<Uint8Array[]>([]);
  const [encryption, setEncryption] = useState<Uint8Array>();

  const [inputValue, setInputValue] = useState(''); // Track the input
  const [chosenValue, setChosenValue] = useState('0'); // Track the confirmed value

  const [inputValueAddress, setInputValueAddress] = useState('');
  const [chosenAddress, setChosenAddress] = useState('0x');
  const [errorMessage, setErrorMessage] = useState('');

  const [decryptedSecret, setDecryptedResult] = useState('???');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Conditional import based on MOCKED environment variable
        let WineRegistry;
        if (!import.meta.env.MOCKED) {
          WineRegistry = await import('@deployments/sepolia/WineRegistry.json');
          console.log(
            `Using ${WineRegistry.address} for the token address on Sepolia`,
          );
        } else {
          WineRegistry = await import(
            '@deployments/localhost/WineRegistry.json'
          );
          console.log(
            `Using ${WineRegistry.address} for the token address on Hardhat Local Node`,
          );
        }

        setContractAddress(WineRegistry.address);
      } catch (error) {
        console.error(
          'Error loading data - you probably forgot to deploy the token contract before running the front-end server:',
          error,
        );
      }
    };

    loadData();
  }, []);

  const handleConfirmAmount = () => {
    setChosenValue(inputValue);
  };

  const handleConfirmAddress = () => {
    const trimmedValue = inputValueAddress.trim().toLowerCase();
    if (ethers.isAddress(trimmedValue)) {
      // getAddress returns the checksummed address
      const checksummedAddress = ethers.getAddress(trimmedValue);
      setChosenAddress(checksummedAddress);
      setErrorMessage('');
    } else {
      setChosenAddress('0x');
      setErrorMessage('Invalid Ethereum address.');
    }
  };

  const instance = getInstance();

  const getHandleBalance = async () => {
    if (contractAddress != ZeroAddress) {
      const contract = new ethers.Contract(
        contractAddress,
        ['function balanceOf(address) view returns (uint256)'],
        readOnlyProvider,
      );
      const handleBalance = await contract.balanceOf(account);
      setHandleBalance(handleBalance.toString());
      setDecryptedBalance('???');
    }
  };

  const encrypt = async (val: bigint) => {
    const now = Date.now();
    try {
      const result = await instance
        .createEncryptedInput(contractAddress, account)
        .add64(val)
        .encrypt();
      console.log(`Took ${(Date.now() - now) / 1000}s`);
      setHandles(result.handles);
      setEncryption(result.inputProof);
    } catch (e) {
      console.error('Encryption error:', e);
      console.log(Date.now() - now);
    }
  };

  const decrypt = async () => {
    const signer = await provider.getSigner();
    try {
      const clearBalance = await reencryptEuint64(
        signer,
        instance,
        BigInt(handleBalance),
        contractAddress,
      );
      setDecryptedBalance(clearBalance.toString());
    } catch (error) {
      if (error === 'Handle is not initialized') {
        // if handle is uninitialized - i.e equal to 0 - we know for sure that the balance is null
        setDecryptedBalance('0');
      } else {
        throw error;
      }
    }
  };

  const saveData = async (data) => {
    console.log(data);

    try {
      const result = await instance
        .createEncryptedInput(contractAddress, account)
        .add64(BigInt(data.copper))
        .add64(BigInt(data.lead))
        .add64(BigInt(data.cadmium))
        .add64(BigInt(data.arsenic))
        .add64(BigInt(data.zinc))
        .add64(BigInt(data.volatileAcidity))
        .encrypt();
      setHandles(result.handles);
      setEncryption(result.inputProof);

      console.log(result);

      const contract = new ethers.Contract(
        contractAddress,
        [
          'function addWine(string, string, uint64, uint64, uint64, uint64, uint64,uint64,string, bytes) public',
        ],
        provider,
      );

      console.log(contract);

      const signer = await provider.getSigner();

      console.log(signer);

      const tx = await contract
        .connect(signer)
        .addWine(
          data.bootleName,
          data.winerieName,
          handles[0],
          handles[1],
          handles[2],
          handles[3],
          handles[4],
          handles[5],
          'Hello wordl',
          toHexString(encryption),
        );
      await tx.wait();
      console.log(tx.hash);
      console.log(result);
    } catch (e) {
      console.error('Encryption error:', e);
    }
  };

  const transferToken = async () => {
    const contract = new ethers.Contract(
      contractAddress,
      ['function transfer(address,bytes32,bytes) external returns (bool)'],
      provider,
    );
    const signer = await provider.getSigner();
    const tx = await contract
      .connect(signer)
      .transfer(
        chosenAddress,
        toHexString(handles[0]),
        toHexString(encryption),
      );
    await tx.wait();
    await getHandleBalance();
  };

  const decryptSecret = async () => {
    const contract = new ethers.Contract(
      contractAddress,
      ['function requestSecret() external'],
      provider,
    );
    const signer = await provider.getSigner();
    const tx = await contract.connect(signer).requestSecret();
    await tx.wait();
  };

  const refreshSecret = async () => {
    const contract = new ethers.Contract(
      contractAddress,
      ['function revealedSecret() view returns(uint64)'],
      readOnlyProvider,
    );
    const revealedSecret = await contract.revealedSecret();
    const revealedSecretString =
      revealedSecret === 0n ? '???' : revealedSecret.toString();
    setDecryptedResult(revealedSecretString);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const formSchema = z.object({
    bootleName: z.string().min(3),
    winerieName: z.string().min(3),
    copper: z.preprocess((val) => Number(val), z.number().min(0)),
    lead: z.preprocess((val) => Number(val), z.number().min(0)),
    cadmium: z.preprocess((val) => Number(val), z.number().min(0)),
    arsenic: z.preprocess((val) => Number(val), z.number().min(0)),
    zinc: z.preprocess((val) => Number(val), z.number().min(0)),
    volatileAcidity: z.preprocess((val) => Number(val), z.number().min(0)),
    privateFields: z.object({
      copper: z.boolean(),
      lead: z.boolean(),
      cadmium: z.boolean(),
      arsenic: z.boolean(),
      zinc: z.boolean(),
      volatileAcidity: z.boolean(),
    }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bootleName: '',
      winerieName: '',
      copper: 0,
      lead: 0,
      cadmium: 0,
      arsenic: 0,
      zinc: 0,
      volatileAcidity: 0,
      privateFields: {
        copper: false,
        lead: false,
        cadmium: false,
        arsenic: false,
        zinc: false,
        volatileAcidity: false,
      },
    },
  });

  const simulateEncryption = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsModalOpen(false);
        }
        return prev + 10;
      });
    }, 1500);
  };

  const onSubmit = async (data) => {
    await saveData(data);
    setIsModalOpen(true);
    simulateEncryption();
  };

  return (
    <div className="container mt-10">
      <img src="./logo.png" className="mx-auto mb-5" width={300} alt="" />
      <h2 className="flex gap-2 justify-center">
        Register your winerie on Openvino and get
        <a
          className="text-rose-600 flex"
          href="https://openvino.atlassian.net/wiki/spaces/OPENVINO/pages/186712130/BioDigital+Certification.doc"
          target="_blank"
          rel="noopener noreferrer"
        >
          Bio Digital Cert <SquareArrowOutUpRight size={10} />
        </a>
      </h2>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full mt-10 text bg-white rounded-md p-10"
        >
          <p className="text-center">
            Please ensure that the data submitted in this form matches the data
            provided to the INV.
          </p>

          {/* Form fields in a grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <FormField
              control={form.control}
              name="bootleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Bootle name</FormLabel>
                  <FormDescription> Name of the bootle</FormDescription>
                  <FormControl>
                    <Input
                      className="w-full h-12"
                      placeholder="MTB18"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="winerieName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Winerie name</FormLabel>
                  <FormDescription> Name of the winerie</FormDescription>
                  <FormControl>
                    <Input
                      className="w-full h-12"
                      placeholder="costaflores"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {[
              'copper',
              'lead',
              'cadmium',
              'arsenic',
              'zinc',
              'volatileAcidity',
            ].map((fieldName) => (
              <FormField
                key={fieldName}
                control={form.control}
                name={fieldName}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">
                      {fieldName} (mg/L)
                    </FormLabel>
                    <FormDescription>
                      Indicates the amount of {fieldName} (encrypted if private)
                    </FormDescription>
                    <FormControl>
                      <Input
                        className="w-full h-12"
                        placeholder="Enter (mg/l)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormField
                      control={form.control}
                      name={`privateFields.${fieldName}`}
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`checkbox_${fieldName}`}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label htmlFor={`checkbox_${fieldName}`}>
                            Make this field private?
                          </label>
                          <InfoModal />
                        </div>
                      )}
                    />
                  </FormItem>
                )}
              />
            ))}
          </div>

          <Button className="w-full h-12" type="submit">
            Submit
          </Button>
        </form>
      </FormProvider>

      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Encrypting Data...</h2>
            <Progress value={progress} />
          </div>
        </div>
      )}
    </div>
  );
  // <div>
  //   <dl>
  //     <dt className="Devnet__title">My encrypted balance is:</dt>
  //     <dd className="Devnet__dd">{handleBalance.toString()}</dd>

  //     <button onClick={() => decrypt()}>
  //       Reencrypt and decrypt my balance
  //     </button>
  //     <dd className="Devnet__dd">
  //       My decrypted private balance is: {decryptedBalance.toString()}
  //     </dd>

  //     <dd className="Devnet__dd">Chose an amount to transfer:</dd>

  //     <div>
  //       <input
  //         type="number"
  //         value={inputValue}
  //         onChange={(e) => setInputValue(e.target.value)}
  //         placeholder="Enter a number"
  //       />{' '}
  //       <button onClick={handleConfirmAmount}>OK</button>
  //       {chosenValue !== null && (
  //         <div>
  //           <p>You chose: {chosenValue}</p>
  //         </div>
  //       )}
  //     </div>

  //     <button onClick={() => encrypt(BigInt(chosenValue))}>
  //       Encrypt {chosenValue}
  //     </button>
  //     <dt className="Devnet__title">
  //       This is an encryption of {chosenValue}:
  //     </dt>
  //     <dd className="Devnet__dd">
  //       <pre className="Devnet__pre">
  //         Handle: {handles.length ? toHexString(handles[0]) : ''}
  //       </pre>
  //       <pre className="Devnet__pre">
  //         Input Proof: {encryption ? toHexString(encryption) : ''}
  //       </pre>
  //     </dd>

  //     <div>
  //       <input
  //         type="text"
  //         value={inputValueAddress}
  //         onChange={(e) => setInputValueAddress(e.target.value)}
  //         placeholder="Receiver address"
  //       />
  //       <button onClick={handleConfirmAddress}>OK</button>{' '}
  //       {chosenAddress && (
  //         <div>
  //           <p>Chosen Address For Receiver: {chosenAddress}</p>
  //         </div>
  //       )}
  //       {errorMessage && (
  //         <div style={{ color: 'red' }}>
  //           <p>{errorMessage}</p>
  //         </div>
  //       )}
  //     </div>

  //     <div>
  //       {chosenAddress !== '0x' && encryption && encryption.length > 0 && (
  //         <button onClick={transferToken}>
  //           Transfer Encrypted Amount To Receiver
  //         </button>
  //       )}
  //     </div>

  //     <div>
  //       <button onClick={decryptSecret} disabled={decryptedSecret !== '???'}>
  //         Request Secret Decryption
  //       </button>
  //     </div>
  //     <div>
  //       <dd className="Devnet__dd">
  //         The decrypted secret value is: {decryptedSecret}{' '}
  //         <button
  //           onClick={refreshSecret}
  //           disabled={decryptedSecret !== '???'}
  //         >
  //           Refresh Decrypted Secret
  //         </button>
  //       </dd>
  //     </div>
  //   </dl>
  // </div>
};
