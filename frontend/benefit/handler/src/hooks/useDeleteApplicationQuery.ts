import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ErrorData } from '../types/common';

const useDeleteApplicationQuery = (): UseMutationResult<
  null,
  AxiosError<ErrorData>,
  string
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation(
    'deleteApplication',
    (id: string) =>
      handleResponse<null>(
        axios.delete(`${BackendEndpoint.HANDLER_APPLICATIONS}${id}/`)
      ),
    {
      onSuccess: () => {
        queryClient.removeQueries('applications', { exact: true });
        return queryClient.invalidateQueries('applicationsList');
      },
    }
  );
};

export default useDeleteApplicationQuery;
