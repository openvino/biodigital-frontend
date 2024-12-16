import { useEffect, useState } from 'react';
import { getInstance } from '../../fhevmjs';
import './Devnet.css';
import { Eip1193Provider, Provider, ZeroAddress } from 'ethers';
import { ethers } from 'ethers';
import ABI from './abi.json';
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
import CryptoJS from 'crypto-js';
import { log } from 'node:console';

const zksyncSepoliaRpcUrl =
  'https://zksync-sepolia.infura.io/v3/d990f644d02e491dab31256c8303cfda';

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
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOrganicState, setIsOrganicState] = useState(false);
  const [verificationResult, setVerificationResult] = useState(false);

  const getWineDetails = async (botleName) => {
    const contract = new ethers.Contract(contractAddress, ABI.abi, provider);

    const wineDetails = await contract.getWine(botleName);

    console.log('Detalles del vino:', wineDetails);

    return wineDetails; // Contendrá detalles cifrados
  };

  const requestIsOrganicDecryption = async (botleName) => {
    const contract = new ethers.Contract(contractAddress, ABI.abi, provider);

    const signer = await provider.getSigner();

    const tx = await contract.connect(signer).requestDecryption(botleName);

    await tx.wait();

    console.log(`Decryption requested for: ${botleName}`);
  };

  const [nextStep, setNextStep] = useState(false);

  const getDecryptedIsOrganic = async () => {
    const contract = new ethers.Contract(contractAddress, ABI.abi, provider);

    const decryptedValue = await contract.getDecryptedIsOrganic();

    console.log('Valor descifrado (isOrganic):', decryptedValue);

    return decryptedValue; // Devuelve 1 (orgánico) o 0 (no orgánico)
  };

  const checkIfOrganic = async (botleName) => {
    try {
      // Paso 1: Obtener detalles del vino
      const wineDetails = await getWineDetails(botleName);
      console.log('Detalles del vino:', wineDetails);

      // Paso 2: Solicitar descifrado del campo `isOrganic`
      await requestIsOrganicDecryption(botleName);
      console.log('Solicitud de descifrado enviada.');

      // Paso 3: Esperar unos segundos y consultar el resultado
      console.log('Esperando resultado descifrado...');
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Esperar 10 segundos

      const decryptedValue = await getDecryptedIsOrganic();

      if (decryptedValue.toString() === '1') {
        setIsOrganicState(true);
      } else {
        setIsOrganicState(false);
      }

      // Paso 4: Determinar si es orgánico
      const isOrganic =
        decryptedValue === 1 ? 'Sí, es orgánico' : 'No, no es orgánico';
      console.log(isOrganic);

      return isOrganic;
    } catch (error) {
      console.error('Error durante el proceso:', error);
      return 'Error en la verificación de orgánico.';
    }
  };

  const saveData = async (data) => {
    try {
      const instance = getInstance();

      // Crear los inputs encriptados
      const result = await instance
        .createEncryptedInput(contractAddress, account)
        .add128(BigInt(data.copper))
        .add128(BigInt(data.lead))
        .add128(BigInt(data.cadmium))
        .add128(BigInt(data.arsenic))
        .add128(BigInt(data.zinc))
        .add128(BigInt(data.volatileAcidity))
        .encrypt();

      const handles = result.handles;
      const inputProof = result.inputProof;

      // Crear instancia del contrato
      const contract = new ethers.Contract(contractAddress, ABI.abi, provider);

      const signer = await provider.getSigner();

      // Llamar al contrato
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
          publicData,
          inputProof,
        );

      await tx.wait();
      console.log('Transaction hash:', tx.hash);

      if (tx.hash) {
        setNextStep(true);
      }
    } catch (e) {
      console.error('Encryption or transaction error:', e);
    }
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
        copper: true,
        lead: true,
        cadmium: true,
        arsenic: true,
        zinc: true,
        volatileAcidity: true,
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
    }, 3000);
  };

  const generateHash = (payload) => {
    console.log('payload', payload);
    console.log(
      'data.botella, data.bodega, data.cobre, data.cadmio, data.plomo, data.arsenico, data.zinc',
      payload.bootleName,
      payload.winerieName,
      payload.copper,
      payload.cadmium,
      payload.lead,
      payload.arsenic,
      payload.zinc,
    );

    const concatenatedData = `${payload.bootleName}&${payload.winerieName}&${payload.copper}&${payload.cadmium}&${payload.lead}&${payload.arsenic}&${payload.zinc}`;
    console.log(concatenatedData);

    const hash = CryptoJS.SHA256(concatenatedData).toString(CryptoJS.enc.Hex);
    console.log('HASH:', hash);

    return `0x${hash}`;
  };
  const [message, setMessage] = useState(
    'Please ensure that your data matchs with the one provided to de INV',
  );

  const onSubmit = async (data) => {
    //check INV
    setIsVerifying(true);
    const hash = generateHash(data);
    console.log('HASH', hash);
    console.log(data.bootleName && '-' && data.winerieName);

    const id = `${data.bootleName}-${data.winerieName}`;
    console.log('****************************', id);

    console.log(zksyncSepoliaRpcUrl);

    const zksyncProvider = new ethers.JsonRpcProvider(zksyncSepoliaRpcUrl);
    const invContractAddress = '0x11306D53Ce3dcF9E31Be90bAffE5E76dfBfA16FA';
    console.log('invContractAddress', invContractAddress);

    console.log('zksyncProvider', zksyncProvider);

    const contractAbi = [
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: 'string',
            name: 'id',
            type: 'string',
          },
        ],
        name: 'DataStored',
        type: 'event',
      },
      {
        inputs: [
          {
            internalType: 'string',
            name: 'id',
            type: 'string',
          },
          {
            internalType: 'bytes32',
            name: 'hash',
            type: 'bytes32',
          },
        ],
        name: 'match_inv_data',
        outputs: [
          {
            internalType: 'bool',
            name: '',
            type: 'bool',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'string',
            name: 'id',
            type: 'string',
          },
          {
            internalType: 'bytes32',
            name: 'hash',
            type: 'bytes32',
          },
        ],
        name: 'storeData',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const contract = new ethers.Contract(
      invContractAddress,
      contractAbi,
      zksyncProvider,
    );
    console.log('CONTRACT', contract);
    const result = await contract.match_inv_data(id, hash);

    console.log(`Match result for id ${id} and hash ${hash}:`, result);
    setMessage(
      result ? 'Datos validados por el INV' : 'Datos no validados por el INV',
    );
    setIsVerifying(false);
    if (!result) return;
    if (nextStep) {
      await checkIfOrganic(data.bootleName);
    }

    try {
      simulateEncryption();

      setIsModalOpen(true);

      await saveData(data);
    } catch (error) {
      setIsModalOpen(false);
    }

    await checkIfOrganic(data.bootleName);
  };
  const [publicData, setPublicData] = useState('');

  let bodyContent;

  if (!isOrganicState) {
    bodyContent = (
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
            <p className="text-center">{message}</p>

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
                        Indicates the amount of {fieldName} (encrypted if
                        private)
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
                              onCheckedChange={(checked) => {
                                field.onChange(checked); // Actualiza el estado del formulario
                                const fieldValue = `${fieldName}-${form.getValues(fieldName)}`;

                                if (!checked) {
                                  // Si se desactiva la casilla, agrega el campo y valor a la cadena
                                  setPublicData((prev) =>
                                    prev ? `${prev},${fieldValue}` : fieldValue,
                                  );
                                } else {
                                  // Si se vuelve a activar, elimina el campo y valor de la cadena
                                  setPublicData((prev) =>
                                    prev
                                      .split(',')
                                      .filter((item) => item !== fieldValue)
                                      .join(','),
                                  );
                                }
                              }}
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
              {nextStep ? 'BioDigitalCert' : 'Submit'}
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
  }

  if (isOrganicState) {
    bodyContent = (
      <div className="flex justify-center items-center text-xl mt-20 bg-rose-700 min-h-[80vh]">
        Your BioDigitalCert is here
      </div>
    );
  }

  return bodyContent;
};
