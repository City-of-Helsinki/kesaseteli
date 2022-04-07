import { render, screen } from '@testing-library/react';
import React from 'react';
import { fakeTetPosting } from 'tet-shared/__tests__/utils/fake-objects';
import TetPosting from 'tet-shared/types/tetposting';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';
import { fakeOptions } from 'tet-shared/__tests__/utils/fake-objects';

import PostingHero from '../PostingHero';

type Props = {
  posting: TetPosting;
  showBackButton: boolean;
};

const title = 'Posting title';
const org_name = 'Organization name';
const keywords = ['Keyword 1', 'Keyword 2'];
const method_keywords = ['Method 1', 'Method 2'];
const attribute_keywords = ['Attribute 1', 'Attribute 2'];

const getFakePosting = (overrides?: Partial<TetPosting>) => {
  return fakeTetPosting({
    title,
    org_name,
    keywords: fakeOptions(keywords),
    keywords_working_methods: fakeOptions(method_keywords),
    keywords_attributes: fakeOptions(attribute_keywords),
  });
};

const renderComponent = (props?: Partial<Props>) => {
  return render(
    <ThemeProvider theme={theme}>
      <PostingHero
        posting={getFakePosting()}
        showBackButton={false}
        {...props}
      />
    </ThemeProvider>
  );
};

test('should render title, organization name ', async () => {
  renderComponent();
  await screen.findByRole('heading', { name: title });
  await screen.findByRole('heading', { name: org_name });
});

test('should render keywords, working methods and attributes', () => {
  renderComponent();
  const allKeyWords = [...keywords, ...method_keywords, ...attribute_keywords];
  allKeyWords.forEach((keyword) => {
    expect(screen.queryByText(keyword)).toBeInTheDocument();
  });
});
