import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { Search } from '../icons'
import { PrimaryButton } from '../buttons'

export interface ISerachInputCustomProps {
  error?: boolean
  touched?: boolean
  focusInput?: boolean
  buttonLabel: string
  onSearchTextChange?: (searchText: string) => void
  onSubmit: (searchText: string) => void
}

export type ISearchInputProps = ISerachInputCustomProps &
  React.InputHTMLAttributes<HTMLInputElement>

const SearchContainer = styled.div`
  width: 100%;
  padding: 10px ${({ theme }) => theme.grid.margin}px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.11);
  display: flex;
  align-items: center;
  justify-content: center;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex-wrap: wrap;
  }
`
const SearchIconAndInput = styled.div`
  display: flex;
  flex: 1 1 auto;
  width: 100%;
`

const SearchButton = styled(PrimaryButton)`
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.secondary};
  font-weight: bold;
  margin: 0 5px;
  &:hover {
    background: linear-gradient(
      ${({ theme }) => theme.colors.headerGradientDark},
      ${({ theme }) => theme.colors.secondary}
    );
    color: ${({ theme }) => theme.colors.white};
    border: ${({ theme }) => theme.colors.white};
  }
`

const SearchIcon = styled(Search)`
  margin-bottom: 5px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.sm}px) {
    display: none;
  }
`
const StyledSearchButton = styled(SearchButton)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-top: 20px;
    margin-bottom: 11px;
    max-width: 200px;
    flex: 1;
  }
`
const StyledInput = styled.input.attrs<ISearchInputProps>({})`
  flex: 1;
  padding: 5px 15px 5px 5px;
  margin: 0 20px 0 10px;
  min-height: 30px;
  min-width: 0px;
  transition: border-color 500ms ease-out;
  border: 0px solid;
  border-bottom: solid 1px ${({ theme }) => theme.colors.secondary};
  ${({ error, touched, theme }) =>
    error && touched ? theme.colors.error : theme.colors.disabled};
  box-sizing: border-box;
  outline: none;
  ${({ theme }) => theme.fonts.defaultFontStyle};
  color: ${({ theme }) => theme.colors.secondary};

  &:focus {
    border-bottom: solid 1px ${({ theme }) => theme.colors.accent};
  }

  &::-webkit-input-placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  &::-moz-placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  &:-ms-input-placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  &[maxlength='1'] {
    -moz-appearance: textfield;
    display: block;
    float: left;
    padding: 0;
    text-align: center;
  }
`
interface IState {
  searchText: string
}

export class SearchInput extends React.Component<ISearchInputProps, IState> {
  private $element: React.RefObject<HTMLInputElement>
  constructor(props: ISearchInputProps, {}) {
    super(props)
    this.state = {
      searchText: ''
    }
    this.$element = React.createRef()
  }
  focusField(): void {
    /*
     * Needs to be run on the next tick
     * so that 'value' prop has enough time to flow back here
     * if the focusInput prop is called right after keydown
     */
    setTimeout(() => {
      this.$element.current!.focus()
    })
  }
  componentWillReceiveProps(nextProps: ISearchInputProps) {
    if (!this.props.focusInput && nextProps.focusInput) {
      this.focusField()
    }
  }

  change = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    this.setState({ searchText: value })
    if (this.props.onSearchTextChange) {
      this.props.onSearchTextChange(value)
    }
  }

  submit = () => {
    this.props.onSubmit(this.state.searchText)
  }

  render() {
    const { focusInput, placeholder, buttonLabel, ...props } = this.props
    const value = this.state.searchText
    return (
      <SearchContainer>
        <SearchIconAndInput>
          <SearchIcon />
          <StyledInput
            onChange={this.change}
            value={value}
            innerRef={this.$element}
            {...this.props}
          />
        </SearchIconAndInput>
        <StyledSearchButton onClick={this.submit}>
          {' '}
          {buttonLabel}
        </StyledSearchButton>
      </SearchContainer>
    )
  }
}
