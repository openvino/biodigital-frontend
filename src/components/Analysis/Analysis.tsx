//@ts-nocheck

import { useEffect, useState } from 'react';
import { getInstance } from '../../fhevmjs';
import { Eip1193Provider, Provider, ZeroAddress } from 'ethers';
import { ethers } from 'ethers';
// import ABI from './abi.json';
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
import ABIWINERY from './abi.js';
import ABIINV from './abi_inv.js';

import CryptoJS from "crypto-js";
import { log } from 'node:console';
import { toast } from 'react-toastify';
import FullScreenSpinner from '../Spinner/Spinner.tsx';
const toHexString = (bytes: Uint8Array) =>
    '0x' +
    bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export type DevnetProps = {
    account: string;
    provider: Eip1193Provider;
    readOnlyProvider: Provider;
};

export const Analysis = ({
    account,
    provider,
    readOnlyProvider,
}: DevnetProps) => {
    const contractAddress = '0xc286649ddafFb319a5A7F0384b5515d6A34f2d58'

    const [isOrganicState, setIsOrganicState] = useState(false);

    const generateHash = (payload) => {
        const concatenatedData = `${payload.bottleName}&${payload.winery}&${payload.copper}&${payload.cadmium}&${payload.lead}&${payload.arsenic}&${payload.zinc}`;
        const hash = CryptoJS.SHA256(concatenatedData).toString(CryptoJS.enc.Hex);
        return `0x${hash}`;
    };

    const requestIsOrganicDecryption = async (botleName: any) => {
        const contract = new ethers.Contract(contractAddress, ABIWINERY, provider);
        const signer = await provider.getSigner();
        const tx = await contract.connect(signer).requestDecryption(botleName);
        await tx.wait();
        console.log(`Decryption requested for: ${botleName}`);
    };


    const getWineDetails = async (botleName: any) => {
        const contract = new ethers.Contract(contractAddress, ABIWINERY, provider);
        const wineDetails = await contract.getWine(botleName);
        console.log('Detalles del vino:', wineDetails);
        return wineDetails;
    };

    const getDecryptedIsOrganic = async () => {
        const contract = new ethers.Contract(contractAddress, ABIWINERY, provider);
        const decryptedValue = await contract.getDecryptedIsOrganic();
        console.log('Valor descifrado (isOrganic):', decryptedValue);
        return decryptedValue;
    };

    const checkIfOrganic = async (botleName: any) => {
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
                setIsOrganicState('organic');
            } else {
                setIsOrganicState('notOrganic');
            }
            // Paso 4: Determinar si es orgánico
            const isOrganic =
                decryptedValue.toString() === '1' ? 'Sí, es orgánico' : 'No, no es orgánico';
            console.log(isOrganic);

            return isOrganic;
        } catch (error) {
            console.error('Error durante el proceso:', error);
            return 'Error en la verificación de orgánico.';
        }
    };


    const saveData = async (data: any) => {
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
            const contract = new ethers.Contract(contractAddress, ABIWINERY, provider);
            //@ts-ignore
            const signer = await provider.getSigner();
            // Llamar al contrato
            const tx = await contract
                .connect(signer)
                //@ts-ignore
                .addWine(
                    data.bottleName,
                    data.winery,
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

        } catch (e) {
            console.error('Encryption or transaction error:', e);
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const formSchema = z.object({
        bottleName: z.string().min(3),
        winery: z.string().min(3),
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
            bottleName: 'MTB18',
            winery: 'Costaflores',
            copper: 5,
            lead: 5,
            cadmium: 5,
            arsenic: 5,
            zinc: 5,
            volatileAcidity: 5,
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

    const [message, setMessage] = useState(
        'Please ensure that your data matchs with the one provided to de INV',
    );

    const verifyHashInv = async (data) => {
        try {
            const hash = generateHash(data);

            const contract = new ethers.Contract('0xd36784d74B2897137b71BB6eeED7f267CF27f864', ABIINV, provider);
            const id = `${data.bottleName}-${data.winery}`;
            const result = await contract.match_inv_data(id, hash);

            if (result) {
                toast.success('Your data matches with the INV!. Proceeding to verify if your wine is organic...');
            }

            return result

        } catch (error) {
            console.log(error);
            toast.error('The information could not be verified, make sure to provide the same data that was provided to the INV');
            return false
        }

    }

    const [tokenData, setTokenData] = useState([]);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            setTokenData(data);
            const result = await verifyHashInv(data);

            if (result) {
                const savedData = await saveData(data);

                await new Promise((resolve) => setTimeout(resolve, 30000)); // Esperar 30 segundos

                const isOrganic = await checkIfOrganic(data.bottleName);

                if (!isOrganic) {
                    toast.error('Your wine is not organic, please try again');
                    return
                }
            } else {
                toast.error('The information could not be verified, make sure to provide the same data that was provided to the INV');
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    const [publicData, setPublicData] = useState('');

    return <div className="container mt-10">


        {loading && (
            <FullScreenSpinner />
        )}

        {isOrganicState === 'organic' && (
            <div className="flex flex-col space-y-2 justify-center items-center text-xl  p-20  ">

                <h2 className='text-2xl'>Congratulations!, your wine is certified!!</h2>
                {tokenData && <p> {tokenData.bottleName}</p>}

                <div className='flex items-center justify-center'>
                    <img width={200} src="/organic2.png" alt="" />
                    <img width={500} src="/biodigitalLogo.webp" alt="" />
                </div>

            </div>
        )}

        {isOrganicState === 'notOrganic' && (
            <div className="flex flex-col space-y-2 justify-center items-center text-xl  p-20  ">

                <h2 className='text-2xl'>We are sorry, we cannot consider your wine as organic.</h2>

            </div>
        )}


        {!isOrganicState && (
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
                            name="bottleName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">Bottle name</FormLabel>
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
                            name="winery"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">Winery name</FormLabel>
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
                        BioDigitalCert
                    </Button>

                </form>
            </FormProvider>
        )}


    </div>;
};
