import { InfoModal } from '@/components/Info/InfoModal';
import { getInstance } from '@/fhevmjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { ethers } from 'ethers';
import { SquareArrowOutUpRight } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import WINERY_ABI from '../../abi/WineryData.json';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form as FormProvider,
} from '../ui/form';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';

const Form = ({ account, provider }) => {
  const CONTRACT_ADDRESS = '0xA3048DFBc542Ab30130D433B706F5f6557713F23';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const formSchema = z.object({
    bootleName: z.string().min(3),
    winerieName: z.string().min(3),
    cooper: z.preprocess((val) => Number(val), z.number().min(0)),
    lead: z.preprocess((val) => Number(val), z.number().min(0)),
    cadmium: z.preprocess((val) => Number(val), z.number().min(0)),
    arsenic: z.preprocess((val) => Number(val), z.number().min(0)),
    zinc: z.preprocess((val) => Number(val), z.number().min(0)),
    privateFields: z.object({
      cooper: z.boolean(),
      lead: z.boolean(),
      cadmium: z.boolean(),
      arsenic: z.boolean(),
      zinc: z.boolean(),
    }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bootleName: '',
      winerieName: '',
      cooper: null,
      lead: null,
      cadmium: null,
      arsenic: null,
      zinc: null,
      privateFields: {
        cooper: false,
        lead: false,
        cadmium: false,
        arsenic: false,
        zinc: false,
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
    setIsModalOpen(true);
    simulateEncryption();

      
  

  };

  return (
    <>
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full mt-10 text bg-white rounded-md p-10">
          <p className="text-center">
            Please ensure that the data submitted in this form matches the data provided to the INV.
          </p>

          {/* Form fields in a grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="bootleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Bootle name</FormLabel>
                  <FormDescription> Name of the bootle</FormDescription>
                  <FormControl>
                    <Input className="w-full h-12" placeholder="MTB18" {...field} />
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
                    <Input className="w-full h-12" placeholder="costaflores" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {['cooper', 'lead', 'cadmium', 'arsenic', 'zinc'].map((fieldName) => (
              <FormField
                key={fieldName}
                control={form.control}
                name={fieldName}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">{fieldName} percent</FormLabel>
                    <FormDescription>Indicates the amount of {fieldName} (encrypted if private)</FormDescription>
                    <FormControl>
                      <Input className="w-full h-12" placeholder="Enter percentage" {...field} />
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
                          <label htmlFor={`checkbox_${fieldName}`}>Make this field private?</label>
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
    </>
  );
};

export default Form;
