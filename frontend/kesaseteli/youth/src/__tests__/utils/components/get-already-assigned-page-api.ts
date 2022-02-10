import { screen, userEvent } from 'shared/__tests__/utils/test-utils';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getAlreadyAssignedPageApi = () => ({
  expectations: {
    pageIsLoaded() {
      return screen.findByRole('heading', {
        name: /hups! olet jo aikaisemmin lähettänyt kesäsetelihakemuksen ja se on nyt käsittelyssä./i,
      });
    },
  },
});

export default getAlreadyAssignedPageApi;
