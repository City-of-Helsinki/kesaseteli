import styled from 'styled-components';

type ViewFieldProps = {
  isInline?: boolean;
  isBold?: boolean;
  isBig?: boolean;
};

type SummaryTableValueProps = {
  isBold?: boolean;
};

export const $ViewField = styled.div<ViewFieldProps>`
  &:not(:last-child) {
    padding-bottom: ${(props) =>
      props.children ? props.theme.spacing.xs4 : 0};
  }
  display: ${(props) => (props.isInline ? 'inline' : 'block')};
  font-weight: ${(props) => (props.isBold ? 500 : 400)};
  font-size: ${(props) =>
    props.isBig ? props.theme.fontSize.heading.m : props.theme.fontSize.body.l};
`;

export const $ViewFieldBold = styled.span`
  font-weight: 500;
`;

export const $SummaryTableHeader = styled.div`
  &:not(:last-child) {
    padding-bottom: ${(props) =>
      props.children ? props.theme.spacing.xs2 : 0};
  }
  font-size: ${(props) => props.theme.fontSize.body.m};
  font-weight: 500;
`;

export const $SummaryTableValue = styled.span<SummaryTableValueProps>`
  font-size: ${(props) => props.theme.fontSize.body.l};
  font-weight: ${(props) => (props.isBold ? '600' : '')};
`;
