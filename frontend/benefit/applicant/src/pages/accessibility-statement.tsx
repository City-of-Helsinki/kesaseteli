import { useTranslation } from 'benefit/applicant/i18n';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import useLocale from 'shared/hooks/useLocale';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const AccessibilityStatement: NextPage = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const tBase = 'common:accessibilityStatement';

  const FeedbackLink: React.FC = () => (
    <a
      rel="noopener noreferrer"
      target="_blank"
      href={`https://palautteet.hel.fi/${locale}/`}
    >
      palautteet.hel.fi
    </a>
  );

  return (
    <>
      <Head>
        <title>{t('common:appName')}</title>
      </Head>

      <Container>
        <$Grid>
          <$GridCell $colSpan={8}>
            <h1>{t(`${tBase}.h1`)}</h1>
            <div id="section1">
              <h2>{t(`${tBase}.sections.section1.heading1`)}</h2>
              <p>{t(`${tBase}.sections.section1.content1`)}</p>
            </div>
            <div id="section2">
              <h2>{t(`${tBase}.sections.section2.heading1`)}</h2>
              <p>{t(`${tBase}.sections.section2.content1`)}</p>
              <p>{t(`${tBase}.sections.section2.content2`)}</p>
            </div>
            <div id="section3">
              <h2>{t(`${tBase}.sections.section3.heading1`)}</h2>
              <p>{t(`${tBase}.sections.section3.content1`)}</p>
              <h2>{t(`${tBase}.sections.section3.heading2`)}</h2>
              <p>{t(`${tBase}.sections.section3.content2`)}</p>
              <ol>
                {[1, 2, 3, 4, 5].map((num) => (
                  <li>
                    {t(`${tBase}.sections.section3.list.item${num}.heading`)}
                    <p>
                      {t(`${tBase}.sections.section3.list.item${num}.text`)}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
            <div id="section4">
              <h2>{t(`${tBase}.sections.section4.heading1`)}</h2>
              <p>{t(`${tBase}.sections.section4.content1`)}</p>
            </div>
            <div id="section5">
              <h2>{t(`${tBase}.sections.section5.heading1`)}</h2>
              <p>{t(`${tBase}.sections.section5.content1`)}</p>
              <p>{t(`${tBase}.sections.section5.content2`)}</p>
              <p>{t(`${tBase}.sections.section5.content3`)}</p>
              <p>{t(`${tBase}.sections.section5.content4`)}</p>
            </div>
            <div id="section6">
              <h2>{t(`${tBase}.sections.section6.heading1`)}</h2>
              <p>{t(`${tBase}.sections.section6.content1`)}</p>
            </div>
            <div id="section7">
              <h2>{t(`${tBase}.sections.section7.heading1`)}</h2>
              <p>{t(`${tBase}.sections.section7.content1`)}</p>
              <p>
                {t(`${tBase}.sections.section7.content2`)}(
                <FeedbackLink />
                ).
              </p>
              <p>{t(`${tBase}.sections.section7.content3`)}</p>
            </div>
            <div id="section8">
              <h2>{t(`${tBase}.sections.section8.heading1`)}</h2>
              <p>
                {t(`${tBase}.sections.section8.content1`)}
                <FeedbackLink />
                {t(`${tBase}.sections.section8.content1end`)}
              </p>
            </div>
            <div id="section9">
              <h2>{t(`${tBase}.sections.section9.heading1`)}</h2>
              <p>{t(`${tBase}.sections.section9.content1`)}</p>
              <p>
                {t(`${tBase}.sections.section9.contact1`)}
                <br />
                {t(`${tBase}.sections.section9.contact2`)}
                <br />
                {t(`${tBase}.sections.section9.contact3`)}
                <br />
                {t(`${tBase}.sections.section9.contact4`)}
                <br />
                {t(`${tBase}.sections.section9.contact5`)}
              </p>
              <p>{t(`${tBase}.sections.section9.content2`)}</p>
            </div>
            <div id="section10">
              <h2>{t(`${tBase}.sections.section10.heading1`)}</h2>
              <p>{t(`${tBase}.sections.section10.content1`)}</p>
              <p>{t(`${tBase}.sections.section10.content2`)}</p>
            </div>
            <div id="section11">
              <h2>{t(`${tBase}.sections.section11.heading1`)}</h2>
              <p>{t(`${tBase}.sections.section11.content1`)}</p>
            </div>
          </$GridCell>
        </$Grid>
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default AccessibilityStatement;
