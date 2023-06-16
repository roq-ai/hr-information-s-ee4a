import AppLayout from 'layout/app-layout';
import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Box,
  Spinner,
  FormErrorMessage,
  Switch,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberInputField,
  NumberIncrementStepper,
  NumberInput,
  Center,
} from '@chakra-ui/react';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import { FiEdit3 } from 'react-icons/fi';
import { useFormik, FormikHelpers } from 'formik';
import { getPayrollById, updatePayrollById } from 'apiSdk/payrolls';
import { Error } from 'components/error';
import { payrollValidationSchema } from 'validationSchema/payrolls';
import { PayrollInterface } from 'interfaces/payroll';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { AsyncSelect } from 'components/async-select';
import { ArrayFormField } from 'components/array-form-field';
import { AccessOperationEnum, AccessServiceEnum, withAuthorization } from '@roq/nextjs';
import { UserInterface } from 'interfaces/user';
import { getUsers } from 'apiSdk/users';

function PayrollEditPage() {
  const router = useRouter();
  const id = router.query.id as string;
  const { data, error, isLoading, mutate } = useSWR<PayrollInterface>(
    () => (id ? `/payrolls/${id}` : null),
    () => getPayrollById(id),
  );
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (values: PayrollInterface, { resetForm }: FormikHelpers<any>) => {
    setFormError(null);
    try {
      const updated = await updatePayrollById(id, values);
      mutate(updated);
      resetForm();
      router.push('/payrolls');
    } catch (error) {
      setFormError(error);
    }
  };

  const formik = useFormik<PayrollInterface>({
    initialValues: data,
    validationSchema: payrollValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
  });

  return (
    <AppLayout>
      <Box bg="white" p={4} rounded="md" shadow="md">
        <Box mb={4}>
          <Text as="h1" fontSize="2xl" fontWeight="bold">
            Edit Payroll
          </Text>
        </Box>
        {error && (
          <Box mb={4}>
            <Error error={error} />
          </Box>
        )}
        {formError && (
          <Box mb={4}>
            <Error error={formError} />
          </Box>
        )}
        {isLoading || (!formik.values && !error) ? (
          <Center>
            <Spinner />
          </Center>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <FormControl id="salary" mb="4" isInvalid={!!formik.errors?.salary}>
              <FormLabel>Salary</FormLabel>
              <NumberInput
                name="salary"
                value={formik.values?.salary}
                onChange={(valueString, valueNumber) =>
                  formik.setFieldValue('salary', Number.isNaN(valueNumber) ? 0 : valueNumber)
                }
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {formik.errors.salary && <FormErrorMessage>{formik.errors?.salary}</FormErrorMessage>}
            </FormControl>
            <FormControl id="deductions" mb="4" isInvalid={!!formik.errors?.deductions}>
              <FormLabel>Deductions</FormLabel>
              <NumberInput
                name="deductions"
                value={formik.values?.deductions}
                onChange={(valueString, valueNumber) =>
                  formik.setFieldValue('deductions', Number.isNaN(valueNumber) ? 0 : valueNumber)
                }
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {formik.errors.deductions && <FormErrorMessage>{formik.errors?.deductions}</FormErrorMessage>}
            </FormControl>
            <AsyncSelect<UserInterface>
              formik={formik}
              name={'employee_id'}
              label={'Select User'}
              placeholder={'Select User'}
              fetcher={getUsers}
              renderOption={(record) => (
                <option key={record.id} value={record.id}>
                  {record?.email}
                </option>
              )}
            />
            <Button isDisabled={formik?.isSubmitting} colorScheme="blue" type="submit" mr="4">
              Submit
            </Button>
          </form>
        )}
      </Box>
    </AppLayout>
  );
}

export default withAuthorization({
  service: AccessServiceEnum.PROJECT,
  entity: 'payroll',
  operation: AccessOperationEnum.UPDATE,
})(PayrollEditPage);
