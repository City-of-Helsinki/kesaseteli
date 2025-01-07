import { Button } from 'hds-react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { LatLngExpression } from 'leaflet';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useTheme } from 'styled-components';
import {
  $Address,
  $Date,
  $MapWrapper,
  $Subtitle,
  $Title,
} from 'tet-shared/components/map/Map.sc';
import TetPosting from 'tet-shared/types/tetposting';

import { Icon } from './MapIcon';
import MarkerClusterGroup from './MarkerClusterGroup';

type Props = {
  postings: TetPosting[];
  center?: number[];
  height?: string;
  zoom?: number;
  zoomToPosition?: boolean;
  showLink?: boolean;
};
// DEFAULT COORDINATE FOR THE MAP TO CENTER TO
// Number format is stupid due to linter...
const defaultCoordinate: number[] = [60.172_207, 24.938_881_7];

const getDateString = (posting: TetPosting): string =>
  `${posting.start_date} - ${posting.end_date ?? ''}`;

const getAddressString = (posting: TetPosting): string => {
  const street_address = posting.location.street_address
    ? `, ${posting.location.street_address}`
    : '';
  const postal_code = posting.location.postal_code
    ? `, ${posting.location.postal_code}`
    : '';
  const city = posting.location.city ? `, ${posting.location.city}` : '';
  return posting.location.name + street_address + postal_code + city;
};

const Map: React.FC<Props> = ({
  postings,
  center = defaultCoordinate,
  height,
  zoom = 12,
  zoomToPosition,
  showLink,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();

  const centerPosition =
    postings.length === 1 && zoomToPosition
      ? [
          postings[0].location.position.coordinates[1],
          postings[0].location.position.coordinates[0],
        ]
      : center;

  const readMoreHandler = (id: string): void => {
    void router.push({
      pathname: '/postings/show',
      query: { id },
    });
  };

  return (
    <$MapWrapper>
      <MapContainer
        center={centerPosition as LatLngExpression}
        zoom={zoom}
        style={{ height }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tiles.hel.ninja/styles/hel-osm-bright/{z}/{x}/{y}{r}.png"
        />
        <MarkerClusterGroup>
          {postings.map((posting) => (
            <Marker
              key={posting.id}
              position={[
                posting.location.position.coordinates[1],
                posting.location.position.coordinates[0],
              ]}
              icon={Icon}
            >
              <Popup>
                <$Subtitle>{t(`common:map.helsinkiCity`)}</$Subtitle>
                <$Title>{posting.org_name}</$Title>
                <$Subtitle>{posting.title}</$Subtitle>
                <$Date>{getDateString(posting)}</$Date>
                <$Address>{getAddressString(posting)}</$Address>
                {showLink && (
                  <Button
                    style={{
                      fontSize: '20px',
                      backgroundColor: `${theme.colors.black60}`,
                      borderColor: `${theme.colors.black60}`,
                    }}
                    role="link"
                    size="small"
                    type="button"
                    onClick={() => readMoreHandler(posting.id)}
                  >
                    {t('common:map.readMore')}
                  </Button>
                )}
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </$MapWrapper>
  );
};

export default Map;
