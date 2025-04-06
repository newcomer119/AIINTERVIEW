import React from 'react'
import { FormControl , FormDescription, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {Input } from '@/components/ui/input'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'
interface FormFieldProps<T extends FieldValues>{
  control :Control<T>
  name : Path<T>
  label : string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'file'
}
const Formfield = <T extends FieldValues>({control, name, label, placeholder, type="text"}: FormFieldProps<T>) => {
  return (
    <Controller 
      name={name} 
      control={control} 
      render={({field}) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type={type} placeholder={placeholder || ""} {...field} />
          </FormControl>
          <FormDescription>
            This is your public display name.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default Formfield