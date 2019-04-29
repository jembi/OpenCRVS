import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'

export const Link = styled.a.attrs<{ error?: boolean }>({})`
  width: auto;
  min-height: 44px;
  color: ${({ error, theme }) =>
    error ? theme.colors.error : theme.colors.accent};
  cursor: pointer;
  border: 0;
  text-decoration: underline;
  ${({ theme }: any) => theme.fonts.infoFontStyle};
`
