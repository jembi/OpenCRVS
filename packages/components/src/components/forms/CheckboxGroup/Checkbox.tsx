import * as React from 'react'
import styled from 'styled-components'
import { Tick } from '../../icons'

const Wrapper = styled.li`
  padding-top: 5px;
  padding-bottom: 5px;
  list-style-type: none;
`

const Label = styled.label`
  position: relative;
  left: 6px;
  top: -2px;
  color: ${({ theme }: any) => theme.colors.copy};
  font-family: ${({ theme }: any) => theme.fonts.regularFont};
  font-size: 16px;
`

const Check = styled.span`
  display: inline-block;
  background: ${({ theme }: any) => theme.colors.primary};
  height: 20px;
  width: 20px;
  transition: border 0.25s linear;
  -webkit-transition: border 0.25s linear;
  position: relative;
  z-index: 1;
  border-radius: 2px;
  &::after {
    display: block;
    position: relative;
    content: '';
    background: ${({ theme }: any) => theme.colors.white};
    border-radius: 2px;
    height: 16px;
    width: 16px;
    top: -12px;
    left: 2px;
    transition: background 0.25s linear;
    -webkit-transition: background 0.25s linear;
  }

  &::before {
    display: block;
    position: relative;
    content: '';
    border-radius: 2px;
    background: ${({ theme }: any) => theme.colors.white};
    height: 14px;
    width: 14px;
    top: 2px;
    left: 2px;
    transition: background 0.25s linear;
    -webkit-transition: background 0.25s linear;
  }
  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -5px;
    margin-top: -3px;
    z-index: 1;
  }
`

const Input = styled.input`
  position: absolute;
  width: 16px;
  height: 16px;
  opacity: 0;
  z-index: 2;
  cursor: pointer;
  /* stylelint-disable */
  &:checked ~ ${Check}::after {
    /* stylelint-enable */
    background: ${({ theme }: any) => theme.colors.primary};
  }
`

interface ICheckbox extends React.OptionHTMLAttributes<{}> {
  name: string
  label: string
  value: string
  selected: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export class Checkbox extends React.Component<ICheckbox> {
  render() {
    const { name, id, selected, label, value, onChange } = this.props
    return (
      <Wrapper>
        <Input
          {...this.props}
          id={id}
          role="checkbox"
          checked={selected}
          type="checkbox"
          name={name}
          value={value}
          onChange={onChange}
        />
        <Check>{selected && <Tick />}</Check>
        <Label htmlFor={id}>{label}</Label>
      </Wrapper>
    )
  }
}
