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
import { getJobApplicationById, updateJobApplicationById } from 'apiSdk/job-applications';
import { Error } from 'components/error';
import { jobApplicationValidationSchema } from 'validationSchema/job-applications';
import { JobApplicationInterface } from 'interfaces/job-application';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { AsyncSelect } from 'components/async-select';
import { ArrayFormField } from 'components/array-form-field';
import { AccessOperationEnum, AccessServiceEnum, withAuthorization } from '@roq/nextjs';
import { CompanyInterface } from 'interfaces/company';
import { getCompanies } from 'apiSdk/companies';

function JobApplicationEditPage() {
  const router = useRouter();
  const id = router.query.id as string;
  const { data, error, isLoading, mutate } = useSWR<JobApplicationInterface>(
    () => (id ? `/job-applications/${id}` : null),
    () => getJobApplicationById(id),
  );
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (values: JobApplicationInterface, { resetForm }: FormikHelpers<any>) => {
    setFormError(null);
    try {
      const updated = await updateJobApplicationById(id, values);
      mutate(updated);
      resetForm();
      router.push('/job-applications');
    } catch (error) {
      setFormError(error);
    }
  };

  const formik = useFormik<JobApplicationInterface>({
    initialValues: data,
    validationSchema: jobApplicationValidationSchema,
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
            Edit Job Application
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
            <FormControl id="applicant_name" mb="4" isInvalid={!!formik.errors?.applicant_name}>
              <FormLabel>Applicant Name</FormLabel>
              <Input
                type="text"
                name="applicant_name"
                value={formik.values?.applicant_name}
                onChange={formik.handleChange}
              />
              {formik.errors.applicant_name && <FormErrorMessage>{formik.errors?.applicant_name}</FormErrorMessage>}
            </FormControl>
            <FormControl id="applicant_email" mb="4" isInvalid={!!formik.errors?.applicant_email}>
              <FormLabel>Applicant Email</FormLabel>
              <Input
                type="text"
                name="applicant_email"
                value={formik.values?.applicant_email}
                onChange={formik.handleChange}
              />
              {formik.errors.applicant_email && <FormErrorMessage>{formik.errors?.applicant_email}</FormErrorMessage>}
            </FormControl>
            <FormControl id="resume" mb="4" isInvalid={!!formik.errors?.resume}>
              <FormLabel>Resume</FormLabel>
              <Input type="text" name="resume" value={formik.values?.resume} onChange={formik.handleChange} />
              {formik.errors.resume && <FormErrorMessage>{formik.errors?.resume}</FormErrorMessage>}
            </FormControl>
            <AsyncSelect<CompanyInterface>
              formik={formik}
              name={'company_id'}
              label={'Select Company'}
              placeholder={'Select Company'}
              fetcher={getCompanies}
              renderOption={(record) => (
                <option key={record.id} value={record.id}>
                  {record?.name}
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
  entity: 'job_application',
  operation: AccessOperationEnum.UPDATE,
})(JobApplicationEditPage);
