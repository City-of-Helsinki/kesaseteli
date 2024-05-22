import { createGlobalStyle } from 'styled-components';

import { Fonts } from './fonts';
import { Main } from './main';

const GlobalStyle = createGlobalStyle`
  ${Fonts}
  ${Main}

  h1 {
    margin: ${(props) => props.theme.spacing.l} 0;
    font-size: ${(props) => props.theme.fontSize.heading.l};
  }

  h2 {
    margin: ${(props) => props.theme.spacing.m} 0;
    font-size: ${(props) => props.theme.fontSize.heading.m};
    font-weight: 500;
  }

  h3 {
    margin: ${(props) => props.theme.spacing.s} 0;
    font-size: ${(props) => props.theme.fontSize.heading.s};
  }

	div#hds-tag {
		border-radius: 15px;
	}

  .sr-only {
    position: absolute !important;
    height: 1px; width: 1px;
    overflow: hidden;
    clip: rect(1px 1px 1px 1px);
    clip: rect(1px, 1px, 1px, 1px);
  }
`;
export default GlobalStyle;
