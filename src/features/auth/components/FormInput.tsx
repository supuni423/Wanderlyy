import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { AppInput, type AppInputProps } from '@/components';

type FormInputProps<T extends FieldValues> = Omit<
  AppInputProps,
  'value' | 'onChangeText' | 'onBlur' | 'error' | 'ref'
> & {
  control: Control<T>;
  name: FieldPath<T>;
  /** Extra hook after the form value changes (e.g. re-check a linked field). */
  onValueChange?: (text: string) => void;
};

/**
 * AppInput connected to react-hook-form: value, blur and the Zod error
 * message come from the form. The ref is registered so the form can
 * move focus (setFocus) and jump to the first invalid field on submit.
 */
export function FormInput<T extends FieldValues>({
  control,
  name,
  onValueChange,
  ...inputProps
}: FormInputProps<T>) {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({ control, name });

  return (
    <AppInput
      {...inputProps}
      ref={ref}
      value={value}
      onChangeText={text => {
        onChange(text);
        onValueChange?.(text);
      }}
      onBlur={onBlur}
      error={error?.message}
    />
  );
}
