import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Tag } from 'hds-react';
import styled from 'styled-components';

export const $Wrapper = styled.div`
  padding: ${(props) => props.theme.spacing.xs2} 0;
  background-color: ${(props) => props.theme.colors.coatOfArms};
  color: ${(props) => props.theme.colors.white};
`;

export const $InnerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const $Col = styled.div`
  display: flex;
`;

export const $ItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-right: ${(props) => props.theme.spacing.xl};
  line-height: ${(props) => props.theme.lineHeight.xl};
`;

export const $ItemHeader = styled.div`
  font-size: ${(props) => props.theme.fontSize.body.m};
  font-weight: 500;
`;

export const $ItemValue = styled.div`
  font-size: ${(props) => props.theme.fontSize.body.m};
`;

export const $HandlerWrapper = styled.div`
  border-radius: 50%;
  background-color: ${(props) => props.theme.colors.white};
  color: ${(props) => props.theme.colors.coatOfArms};
  padding: ${(props) => props.theme.spacing.s};
  font-size: ${(props) => props.theme.fontSize.heading.s};
  font-weight: 500;
  letter-spacing: 2px;
  line-height: ${(props) => props.theme.lineHeight.l};
`;

type StatusLabelProps = {
  status?: APPLICATION_STATUSES;
};

export const $StatusLabel = styled(Tag)<StatusLabelProps>`
  background-color: ${(props) => {
    switch (props.status) {
      case APPLICATION_STATUSES.HANDLING:
        return props.theme.colors.coatOfArmsMediumLight;

      case APPLICATION_STATUSES.INFO_REQUIRED:
        return props.theme.colors.summerMediumLight;

      case APPLICATION_STATUSES.ACCEPTED:
        return props.theme.colors.tramMediumLight;

      case APPLICATION_STATUSES.REJECTED:
        return props.theme.colors.brickMediumLight;

      default:
        return props.theme.colors.coatOfArmsMediumLight;
    }
  }};
`;
