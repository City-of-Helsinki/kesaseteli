import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import React from 'react';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import JobPostings from 'tet/youth/components/jobPostings/JobPostings';
import HeaderLinks from 'tet-shared/components/HeaderLinks';

const Postings: NextPage = () => (
  <>
    <HeaderLinks />
    <JobPostings />
  </>
);

export const getStaticProps: GetStaticProps = getServerSideTranslations('common');

export default Postings;
