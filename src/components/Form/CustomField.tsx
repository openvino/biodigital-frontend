import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '../ui/textarea';


interface CustomFormFieldProps {
    control: any;
    name: string;
    label?: string;
    description?: string;
    type?: 'text' | 'select' | 'radio' | 'checkbox' | 'date' | 'textarea' | 'file';
    options?: any[];
    multiple?: boolean;
    placeholder?: string;
}

const CustomFormField: React.FC<CustomFormFieldProps> = ({
    control,
    name,
    label,
    description,
    type = 'text',
    options = [] as { value: string; label: string, disabled?: boolean }[],
    multiple = false,
    placeholder = '',
    ...rest
}) => {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel className="text-lg">{label}</FormLabel>}
                    {description && <FormDescription>{description}</FormDescription>}
                    <FormControl>
                        {type === 'select' ? (
                            <Select onValueChange={field.onChange} value={field.value} {...rest}>
                                <SelectTrigger className="w-full bg-white h-12">
                                    <SelectValue placeholder={placeholder} />
                                </SelectTrigger>
                                <SelectContent>
                                    {options.map((option) => (
                                        <SelectItem key={option.value} disabled={option.disabled} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : type === 'radio' ? (
                            <RadioGroup value={field.value} onValueChange={field.onChange} {...rest}>
                                {options.map((option) => (
                                    <div key={option.value} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option.value} id={option.value} />
                                        <label htmlFor={option.value}>{option.label}</label>
                                    </div>
                                ))}
                            </RadioGroup>
                        ) : type === 'checkbox' ? (
                            <div className="grid md:grid-cols-3 grid-cols-2 items-center space-y-4">
                                {options.map((option, i) => (
                                    <div key={i} className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={field.value?.includes(option.value)}
                                            onCheckedChange={(checked) => {
                                                const newValue = checked
                                                    ? [...(field.value || []), option.value]
                                                    : field.value.filter((v: string) => v !== option.value);
                                                field.onChange(newValue);
                                            }}
                                        />
                                        <FormLabel>{option.label}</FormLabel>
                                    </div>
                                ))}
                            </div>

                        ) : type === 'date' ? (<Input
                            className="bg-white border w-full h-12 p-2"
                            type="date"
                            value={field.value ? field.value.toISOString().split("T")[0] : ""}
                            onChange={(e) => {
                                const selectedDate = new Date(e.target.value);
                                const localDate = new Date(selectedDate.getTime() + selectedDate.getTimezoneOffset() * 60000);
                                field.onChange(localDate);
                            }}
                        />
                        ) : type === 'textarea' ? (
                            <Textarea className='bg-white border w-full h-28 p-2' {...field} />
                        ) : type === 'file' ? (
                            <Input type='file' onChange={(e) => field.onChange(e.target.files?.[0])} className='w-full bg-white h-12' />
                        ) : (
                            <Input
                                className="bg-white w-full h-12"
                                type={type}
                                placeholder={placeholder}
                                {...field}
                                {...rest}
                            />
                        )}
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export default CustomFormField;

