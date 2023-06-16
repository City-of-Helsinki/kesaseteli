import { ErrorResponse } from 'benefit/handler/types/common';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { UploadAttachmentData } from 'shared/types/attachment';

const useUploadAttachmentQuery = (): UseMutationResult<
  UploadAttachmentData,
  ErrorResponse,
  UploadAttachmentData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<UploadAttachmentData, ErrorResponse, UploadAttachmentData>(
    ['attachment'],
    (attachment: UploadAttachmentData) =>
      !attachment?.applicationId
        ? Promise.reject(new Error('Missing application id'))
        : handleResponse<UploadAttachmentData>(
            axios.post(
              `${BackendEndpoint.HANDLER_APPLICATIONS}${attachment?.applicationId}/attachments/`,
              attachment.data,
              {
                headers: {
                  'Content-type': 'multipart/form-data',
                },
              }
            )
          ),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries('applications');
        void queryClient.invalidateQueries('application');
      },
    }
  );
};

export default useUploadAttachmentQuery;
