import React from 'react';
import { TetData } from 'tet-shared/types/TetData';
import Container from 'tet-shared//components/container/Container';
import {
  $PostingHero,
  $ImageContainer,
  $HeroWrapper,
  $HeroContentWrapper,
  $Keywords,
  $Title,
  $Subtitle,
  $Date,
  $Spots,
  $Address,
  $ContactTitle,
  $ContactInfo,
} from 'tet-shared//components/posting/postingHero/PostingHero.sc';
import { useTranslation } from 'next-i18next';
import { IconLocation, Button, Tag } from 'hds-react';

type Props = {
  posting: TetData;
};

const PostingHero: React.FC<Props> = ({ posting }) => {
  const { t } = useTranslation();
  const date =
    posting.start_date + (posting.end_date ? ` - ${posting.end_date}` : '');
  const address = `${posting.location.name}, ${posting.location.street_address}, ${posting.location.postal_code}, ${posting.location.city}`;

  const keywordList = (list: string[], color: string) => {
    //TODO use different color for the lists
    return (
      <>
        {list.map((keyword: string) => (
          <li>
            <Tag
              theme={{
                '--tag-background': `var(--color-${color})`,
                '--tag-color': 'var(--color-black-90)',
                '--tag-focus-outline-color': 'var(--color-black-90)',
              }}
            >
              {keyword}
            </Tag>
          </li>
        ))}
      </>
    );
  };

  return (
    <$PostingHero>
      <Container>
        <$HeroWrapper>
          <$ImageContainer
            imageUrl={
              'https://kirkanta.kirjastot.fi/files/images/medium/kallio-4f901aa2.jpg'
            }
          ></$ImageContainer>
          <$HeroContentWrapper>
            <$Keywords>
              {keywordList(posting.keywords_working_methods, 'success-light')}
              {keywordList(
                posting.keywords_attributes,
                'coat-of-arms-medium-light'
              )}
              {keywordList(posting.keywords, 'engel-medium-light')}
            </$Keywords>
            <$Title>{posting.org_name}</$Title>
            <$Subtitle>{posting.title}</$Subtitle>
            <$Date>{date}</$Date>
            <$Spots>
              {t('common:postingTemplate.spots')}: {posting.spots}
            </$Spots>
            <$Address>
              <IconLocation />
              <span>{address}</span>
            </$Address>
            <$ContactTitle>{t('common:postingTemplate.contact')}</$ContactTitle>
            <$ContactInfo>
              <li>
                {posting.contact_first_name} {posting.contact_last_name}
              </li>
              <li>{posting.contact_phone}</li>
              <li>{posting.contact_email}</li>
            </$ContactInfo>
          </$HeroContentWrapper>
        </$HeroWrapper>
      </Container>
    </$PostingHero>
  );
};

export default PostingHero;
