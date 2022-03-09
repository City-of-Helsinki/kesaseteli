import * as React from 'react';
import {
  $PostingCard,
  $ImageContainer,
  $PostingCardBody,
  $PostingCardBodyFooter,
  $PostingTitle,
  $PostingSubtitle,
  $PostingDescription,
  $PostingAddress,
  $PostingDate,
  $PostingLanguages,
} from 'tet/youth/components/jobPostingCard/JobPostingCard.sc';
import JobPostingCardKeywords from './JobPostingCardKeywords';
import { useRouter } from 'next/router';
import { IconPhoto } from 'hds-react';
import { Button } from 'hds-react';
import { useTheme } from 'styled-components';
import { OptionType } from 'tet-shared/types/classification';

type Props = {
  jobPosting: any;
};

const JobPostingCard: React.FC<Props> = ({ jobPosting }) => {
  const theme = useTheme();
  const router = useRouter();

  const date = jobPosting.start_date + (jobPosting.end_date ? ` - ${jobPosting.end_date}` : '');
  const street_address = jobPosting.location.street_address ? `, ${jobPosting.location.street_address}` : '';
  const postal_code = jobPosting.location.postal_code ? `, ${jobPosting.location.postal_code}` : '';
  const city = jobPosting.location.city ? `, ${jobPosting.location.city}` : '';
  const address = jobPosting.location.name + street_address + postal_code + city;
  const languages = jobPosting.languages.map((language: OptionType) => language.label).join(', ');

  const readMoreHandler = () => {
    void router.push({
      pathname: '/postings/show',
      query: { id: jobPosting.id },
    });
  };

  return (
    <$PostingCard>
      <$ImageContainer>
        <IconPhoto />
      </$ImageContainer>
      <$PostingCardBody>
        <JobPostingCardKeywords jobPosting={jobPosting} />
        <$PostingTitle>{jobPosting.org_name}</$PostingTitle>
        <$PostingSubtitle>{jobPosting.title}</$PostingSubtitle>
        <$PostingDate>{date}</$PostingDate>
        <$PostingAddress> {address}</$PostingAddress>
        <$PostingDescription>{jobPosting.description}</$PostingDescription>
        <$PostingLanguages>
          <span>Kielisyys:</span> {languages}
        </$PostingLanguages>
        <$PostingCardBodyFooter>
          <Button
            style={{
              fontSize: '20px',
              backgroundColor: `${theme.colors.black60}`,
              borderColor: `${theme.colors.black60}`,
            }}
            onClick={readMoreHandler}
            size="small"
            type="button"
          >
            Lue lisää
          </Button>
        </$PostingCardBodyFooter>
      </$PostingCardBody>
    </$PostingCard>
  );
};

export default JobPostingCard;
