import {
  NumberInput as HdsNumberInput,
  TextArea as HdsTextArea,
  TextInput as HdsTextInput,
} from 'hds-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  $GridCell,
  GridCellProps,
} from 'shared/components/forms/section/FormSection.sc';
import InputProps from 'shared/types/input-props';

import { $TextInput } from './TextInput.sc';

export type TextInputProps<T> = InputProps<T> & {
  type?: 'text' | 'decimal' | 'number' | 'textArea';
  placeholder?: string;
} & GridCellProps;

const getComponentType = <T,>(
  type: TextInputProps<T>['type']
): typeof HdsTextInput | typeof HdsNumberInput | typeof HdsTextArea => {
  switch (type) {
    case 'number':
    case 'decimal':
      return HdsNumberInput;

    case 'textArea':
      return HdsTextArea;

    case 'text':
    default:
      return HdsTextInput;
  }
};

const TextInput = <T,>({
  id,
  type = 'text',
  placeholder,
  initialValue,
  label,
  errorText,
  registerOptions = {},
  onChange,
  ...rest
}: TextInputProps<T>): React.ReactElement<T> => {
  const { $colSpan, $rowSpan, $colStart, alignSelf, justifySelf } = rest;
  const $gridCellProps = {
    $colSpan,
    $rowSpan,
    $colStart,
    alignSelf,
    justifySelf,
  };
  const { register, watch } = useFormContext<T>();
  const value = watch(id) as string;
  const preventScrolling = React.useCallback(
    (event: React.WheelEvent<HTMLInputElement>) => event.currentTarget.blur(),
    []
  );

  const lengthIndicator = React.useMemo(
    () =>
      type === 'textArea' && registerOptions.maxLength && value?.length > 0
        ? `${value?.length}/${registerOptions.maxLength as number}`
        : undefined,
    [registerOptions.maxLength, type, value?.length]
  );

  const registerEvents = { ...register(id, registerOptions) };

  return (
    <$GridCell {...$gridCellProps}>
      <$TextInput
        {...registerEvents}
        onChange={(e) => {
          registerEvents.onChange(e);
          onChange && onChange(e.target.value);
        }}
        as={getComponentType(type)}
        key={id}
        id={id}
        data-testid={id}
        name={id}
        placeholder={placeholder}
        required={Boolean(registerOptions.required)}
        max={
          registerOptions.maxLength
            ? String(registerOptions.maxLength)
            : undefined
        }
        helperText={lengthIndicator}
        defaultValue={initialValue}
        onWheel={preventScrolling}
        errorText={errorText}
        label={label}
        invalid={Boolean(errorText)}
        aria-invalid={Boolean(errorText)}
      />
    </$GridCell>
  );
};

export default TextInput;
