//@ts-nocheck
import { zodResolver } from '@hookform/resolvers/zod';
import { SquareArrowOutUpRight } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';
import {
  FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Form as FormProvider,
} from '../ui/form';
import "leaflet/dist/leaflet.css"
import Map from '../Map/Map';
import CustomFormField from './CustomField';
import { useNavigate } from 'react-router-dom';

interface FormProps {
  account: any; // Idealmente, reemplaza 'any' por el tipo correcto
  provider: any;
  readOnlyProvider: any;
}

const Form: React.FC<FormProps> = ({ account, provider, readOnlyProvider }: any) => {

  const navigate = useNavigate();
  const formSchema = z.object({
    wineryName: z.string().optional(),
    bottleName: z.string().optional(),
    token: z.string().optional(),
    digitalCert: z.string().optional(),
    wineryContact: z.string().optional(),
    wineryLocation: z.array(z.object({
      lat: z.number(),
      lng: z.number()
    })),
    vineyardName: z.string().optional(),
    varietal: z.string().optional(),
    yearOfPlanting: z.date(),
    vineyardLocation: z.array(z.object({ lat: z.number(), lng: z.number() })),
    vineyardDemarcation: z.array(z.object({ lat: z.number(), lng: z.number() })),
    vineyardNeighbors: z.string().optional(),
    vineyardNeighborsFile: z.instanceof(File),
    isCertified: z.string().min(1),
    certificationFile: z.instanceof(File).optional(),
    soilProtection: z.string().optional(),
    soilFertility: z.string().optional(),
    machinery: z.string().optional(),
    contaminationRisks: z.array(z.string().optional()),
    irrigation: z.array(z.string().optional()),
    soilSample: z.instanceof(File),
    soilMoisture: z.string().optional(),
    waterAnalysis: z.instanceof(File),
    weedManagement: z.string().optional(),
    fertilizers: z.string().optional(),
    waterSource: z.string().optional(),
    plantImage: z.instanceof(File),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wineryName: "",
      bottleName: "",
      token: "",
      digitalCert: "",
      wineryContact: "",
      wineryLocation: [],
      vineyardName: "",
      varietal: "",
      yearOfPlanting: new Date(),
      vineyardLocation: [],
      vineyardDemarcation: [],
      vineyardNeighbors: "",
      vineyardNeighborsFile: undefined,
      isCertified: "",
      certificationFile: undefined,
      soilProtection: "",
      soilFertility: "",
      machinery: "",
      contaminationRisks: [],
      irrigation: [],
      soilMoisture: "",
      plantImage: undefined,
      waterAnalysis: undefined,
      weedManagement: "",
      fertilizers: "",
      waterSource: "",
      soilSample: undefined
    },
  });

  const handleContinueWineAnalysis = () => {
    navigate('/chemical-analysis')
  }

  const isCertified = form.watch("isCertified");

  const onSubmit = async (data: any) => {
    try {
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <img src="./biodigitalLogo.webp" className="mx-auto mb-5" width={300} alt="" />
      <h2 className="flex gap-2 justify-center">
        Register your Winery on OpenVino and get
        <a
          className="text-rose-600 flex"
          href="https://openvino.atlassian.net/wiki/spaces/OPENVINO/pages/186712130/BioDigital+Certification.doc"
          target="_blank"
          rel="noopener noreferrer"
        >
          BioDigital Certification <SquareArrowOutUpRight size={10} />
        </a>
      </h2>

      <>
        <div className=''>

        </div>
        <FormProvider {...form} >
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.log("Validation errors:", errors);
          })} className="space-y-8 text-left mt-10 text-xl w-4/4  bg-[#fefffe] rounded-lg p-5">
            <p className="text-center">
              Please ensure that the data submitted in this form matches the data provided to the INV.
            </p>
            <h1 className='text-center text-xl'>Winery Information</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3  p-1">
              <CustomFormField
                control={form.control}
                name='wineryName'
                description='Name of the Winery'
                label='Winery name'
                placeholder='costaflores' />

              <CustomFormField
                control={form.control}
                description='This BioDigital Cert applies to the token backed by wines'
                label='Token to Certify'
                name='token'
                placeholder='Select a token'
                type='select'
                options={[
                  { value: 'MTB18', label: 'MTB18' },
                  { value: 'MTB19', label: 'MTB19' },
                  { value: 'MTB20', label: 'MTB20' },
                  { value: 'MTB21', label: 'MTB21' },
                  { value: 'MTB22', label: 'MTB22' },
                  { value: 'MTB23', label: 'MTB23' },
                  { value: 'MTB24', label: 'MTB24' },]}

              />

              <CustomFormField
                control={form.control}
                description='Select the type of BioDigital Certification'
                label='BioDigital Cert'
                name='digitalCert'
                placeholder='Select a digital cert'
                type='select'
                options={[
                  { value: 'organic', label: 'Organic', disabled: false },
                  { value: 'vegan', label: 'Vegan', disabled: true },
                  { value: 'CAVA', label: 'CAVA', disabled: true },
                ]}
              />

              <CustomFormField
                control={form.control}
                description='Who is in charge of Organic certification?'
                label='Winery Cert Contact'
                name='wineryContact'
                placeholder=' name, telegram, wallet'
                type='text'
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="wineryLocation"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-lg">Winery Location</FormLabel>
                    <FormDescription> Where is the winery located?</FormDescription>
                    <FormControl>
                      <Controller name='wineryLocation' control={form.control} render={() => (
                        <Map multiple={false} onLocationSelect={(coords) => {
                          form.setValue('wineryLocation', coords);
                        }} />)} />

                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <h1 className='text-3xl text-center'>Vineyard Information</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-center'>

              <CustomFormField
                control={form.control}
                name='vineyardName'
                description='Name of the vineyard'
                label='Vineyard name'
                placeholder='costaflores'
                type='text'
              />

              <CustomFormField
                control={form.control}
                name='varietal'
                description='Vineyard variety'
                label='Grape Varietal'
                placeholder='Grape Varietal'
                type='text' />

              <CustomFormField
                control={form.control}
                name='yearOfPlanting'
                description='Year of planting'
                label='Year of planting'
                placeholder='Year of planting'
                type='date'
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="vineyardLocation"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-lg">Vineyard Location</FormLabel>
                    <FormDescription>Provide four points to outline the vineyard</FormDescription>
                    <FormControl>
                      <Map
                        multiple={true}
                        onLocationSelect={(coords) => {
                          if (coords.length <= 4) {
                            form.setValue("vineyardLocation", coords);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="vineyardDemarcation"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-lg">Vineyard Demarcation</FormLabel>
                    <FormDescription>Provide four points demonstrating the separation of the vineyard from other agricultural production
                    </FormDescription>
                    <FormControl>
                      <Map
                        multiple={true}
                        onLocationSelect={(coords) => {
                          if (coords.length <= 4) {
                            form.setValue("vineyardDemarcation", coords);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-center '>
              <CustomFormField
                control={form.control}
                name="vineyardNeighbors"
                label="Vineyard Neighbors"
                description="Provide the name, description (farm, empty lot, road, etc.) for up to 6. Organic yes/no separation description."
                type="text"
                placeholder="Enter neighbor description"
              />

              <CustomFormField
                control={form.control}
                name="vineyardNeighborsFile"
                label="Upload Neighbor Details"
                description="Upload a file with detailed information about the vineyard neighbors."
                type="file"
              />

              <CustomFormField
                control={form.control}
                name="isCertified"
                label="Is the wine currently certified?"
                description="Has this winery and vineyard been previously certified?"
                type="radio"
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
              />

              {isCertified === "yes" && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 space-y-2 items-center mt-1  '>
                  <CustomFormField
                    control={form.control}
                    name="certificationFile"
                    label="Upload Certification File"
                    description="Upload a document proving the certification."
                    type="file"
                  />

                  <CustomFormField
                    control={form.control}
                    name="cerftificationType"
                    label="Certification Type"
                    description="Select the type of certification."
                    type="select"
                    options={[
                      { value: 'organic', label: 'Organic' },
                      { value: 'vegan', label: 'Vegan' },
                      { value: 'CAVA', label: 'CAVA' },
                    ]}
                  />

                </div>

              )}
            </div>

            <div className='flex flex-col  justify-center gap-3'>

              <CustomFormField
                control={form.control}
                name={"soilProtection"}
                label="Soil Protection"
                description="How are you protecting the soil?"
                type="textarea"
              />

              <CustomFormField
                control={form.control}
                name={"soilFertility"}
                label="How are you maintaining soil fertiility"
                description="Describe the actions used to maintain soil fertility."
                type="textarea"
              />

              <CustomFormField
                control={form.control}
                name={"machinery"}
                label="Machinery / Equipment"
                description="What machinery / equipment is used, and how is it cleaned"
                type="textarea"
              />

            </div>

            <CustomFormField
              control={form.control}
              name={"contaminationRisks"}
              label="Contamination Risks"
              description=" What contamination risks exist on the vineyard?"
              type="checkbox"
              options={[
                { label: 'Contaminated watercourses', value: "Contaminated watercourses" },
                { label: 'Aerial spraying in the area', value: 'Aerial spraying in the area' },
                { label: 'Fumigation on roadsides, ditches, irrigation ditches, etc.', value: 'Fumigation on roadsides, ditches, irrigation ditches, etc.' },
                { label: 'Fumigations in neighboring fields', value: 'Fumigations in neighboring fields' },
                { label: 'Transgenic crops in the field or in neighboring fields', value: 'Transgenic crops in the field or in neighboring fields' },
                { label: 'Nearby factories', value: 'Nearby factories' },
                { label: 'Others', value: 'Others' },

              ]}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 items-center  mt-7'>

              <CustomFormField
                control={form.control}
                name='soilSample'
                description='Provide the most recent soil sample analysis.'
                label='Soil Sample'
                type='file'
              />

              <CustomFormField
                control={form.control}
                name='plantImage'
                description='What are the most recent images of the vines?'
                label='Plant images'
                type='file'
              />

              <CustomFormField
                control={form.control}
                name='soilMoisture'
                description='Provide Vinduino soil sensor data.'
                label='Soil moisture'
                type='text'
              />

              <CustomFormField
                control={form.control}
                name='waterAnalysis'
                description='Provide the most recent water analysis conducted by an independent laboratory.'
                label='Water Analysis'
                type='file'
              />

              <CustomFormField
                control={form.control}
                name='weedManagement'
                description='Describe how weeds are managed.'
                label='Weed management'
                type='textarea'
              />

              <CustomFormField
                control={form.control}
                name='fertilizers'
                description="Provide fertilizer link's"
                label='Fertilizers'
                type='text'
              />

            </div>

            <CustomFormField
              control={form.control}
              name={"irrigation"}
              label="Irrigation"
              description="Describe the actions used to maintain irrigation."
              type="checkbox"
              options={[
                { label: 'Drip irrigation', value: "drip" },
                { label: 'Sprinkler irrigation', value: "aspersion" },
                { label: 'Surface irrigation - flood irrigation', value: "superficial" },
                { label: 'Furrow irrigation', value: "mantle" },
                { label: 'Basin irrigation', value: "groove" },
                { label: 'Melgas', value: "melgas" },
              ]}
            />

            <CustomFormField
              control={form.control}
              name='waterSource'
              label='Water source (well, canal, shared)'
              description='lat./lon. source, provide sat image of canal source. if shared, describe how this is not contaminated'
              type='textarea'
            />

            <div className='flex justify-center'>
              <Button onClick={handleContinueWineAnalysis} className=" h-12" type="button">
                Continue to wine analysis
              </Button>
            </div>
          </form >
        </FormProvider ></>


    </>
  );
};

export default Form;
