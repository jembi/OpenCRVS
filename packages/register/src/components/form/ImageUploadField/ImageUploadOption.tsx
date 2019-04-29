import * as React from 'react'
import styled from 'styled-components'
import { ActionPage, Box } from '@opencrvs/components/lib/interface'
import { ImageUploader } from '@opencrvs/components/lib/forms'
import { ArrowForward } from '@opencrvs/components/lib/icons'
import { FormFieldGenerator } from 'components/form'
import { IFormSection, IFormSectionData, IFileValue } from 'forms'
import { hasFormError } from 'forms/utils'
import { HeaderContent } from '@opencrvs/components/lib/layout'

const FormContainer = styled.div`
  padding: 35px 25px;
`
export const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background};
  z-index: 4;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
`
const FormAction = styled.div`
  display: flex;
  justify-content: center;
`
const FormImageUploader = styled(ImageUploader)`
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.27);
`

type State = {
  data: IFormSectionData
  showUploadButton: boolean
}

type IProps = {
  option: IFormSection
  backLabel?: string
  title?: string
  onComplete: (file: IFileValue) => void
  toggleNestedSection: () => void
}

export class ImageUploadOption extends React.Component<IProps, State> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      data: {},
      showUploadButton: false
    }
  }

  storeData = (documentData: IFormSectionData) => {
    const showUploadButton = this.shouldShowUploadButton(documentData)
    this.setState({
      data: documentData,
      showUploadButton
    })
  }

  shouldShowUploadButton = (documentData: IFormSectionData) => {
    return documentData && !hasFormError(this.props.option.fields, documentData)
  }

  handleFileChange = (uploadedImage: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (reader.result) {
        this.props.onComplete({
          optionValues: Object.values(this.state.data),
          type: uploadedImage.type,
          data: reader.result.toString()
        })
      }
    }
    reader.readAsDataURL(uploadedImage)
  }

  render = () => {
    const { option, title, backLabel } = this.props
    return (
      <OverlayContainer>
        <ActionPage
          title={title ? title : 'Upload'}
          backLabel={backLabel}
          goBack={this.props.toggleNestedSection}
        >
          <HeaderContent>
            <FormContainer>
              <Box>
                <FormFieldGenerator
                  id={option.id}
                  onChange={this.storeData}
                  setAllFieldsDirty={false}
                  fields={option.fields}
                />
                {this.state.showUploadButton && (
                  <FormAction>
                    <FormImageUploader
                      id="upload_document"
                      title={title ? title : 'Upload'}
                      icon={() => <ArrowForward />}
                      handleFileChange={this.handleFileChange}
                    />
                  </FormAction>
                )}
              </Box>
            </FormContainer>
          </HeaderContent>
        </ActionPage>
      </OverlayContainer>
    )
  }
}
