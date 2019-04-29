import * as React from 'react'
import ReactPanZoom from './PanDraggable'
import styled, { css } from 'styled-components'
import {} from '../../icons'
import { ZoomIn, ZoomOut, RotateLeft } from '../../icons'
const Container = css`
  width: 100%;
  min-height: calc(100vh - 500px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  & img {
    width: 100%;
  }
`
const ControlsContainer = styled.div`
  position: absolute;
  right: 10px;
  z-index: 2;
  top: 10px;
  user-select: none;
  border-radius: 2px;

  background: ${({ theme }: any) => theme.colors.white};
  box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
  & div {
    text-align: center;
    cursor: pointer;
    height: 40px;
    width: 40px;

    border-bottom: 1px solid ${({ theme }: any) => theme.colors.disabledButton};
    & svg {
      height: 100%;
      width: 100%;
      padding: 10px;
      box-sizing: border-box;
    }
    &:last-child {
      border: none;
    }
    &:active {
      box-shadow: 0px 0px 5px 1px ${({ theme }: any) => theme.colors.disabled};
    }
  }
`

interface IProps {
  image: string
}

export default class PanViewer extends React.Component<IProps> {
  state = {
    dx: 0,
    dy: 0,
    zoom: 1,
    rotation: 0
  }

  renderPanZoomControls = () => {
    return (
      <ControlsContainer>
        <div onClick={this.zoomIn}>
          <ZoomIn />
        </div>
        <div onClick={this.zoomOut}>
          <ZoomOut />
        </div>
        <div onClick={this.rotateLeft}>
          <RotateLeft />
        </div>
      </ControlsContainer>
    )
  }
  componentDidMount() {
    document.addEventListener('keypress', e => {
      if (e.keyCode === 43 || e.keyCode === 61) {
        this.zoomIn()
      } else if (e.keyCode === 45) {
        this.zoomOut()
      } else if (e.keyCode === 114 || e.keyCode === 82) {
        this.rotateLeft()
      }
    })
  }
  render() {
    const StyledReactPanZoom = styled(ReactPanZoom)`
      ${Container};
    `
    return (
      <React.Fragment>
        {this.renderPanZoomControls()}
        <StyledReactPanZoom
          zoom={this.state.zoom}
          pandx={this.state.dx}
          pandy={this.state.dy}
          onPan={this.onPan}
          rotation={this.state.rotation}
          key={this.state.dx}
        >
          <img
            style={{
              transform: `rotate(${this.state.rotation * 90}deg)`
            }}
            src={this.props.image}
            alt="Supporting Document"
          />
        </StyledReactPanZoom>
      </React.Fragment>
    )
  }

  zoomIn = () => {
    this.setState({
      zoom: this.state.zoom + 0.2
    })
  }

  zoomOut = () => {
    if (this.state.zoom >= 1) {
      this.setState({
        zoom: this.state.zoom - 0.2
      })
    }
  }
  rotateLeft = () => {
    if (this.state.rotation === -3) {
      this.setState({
        rotation: 0
      })
    } else {
      this.setState({
        rotation: this.state.rotation - 1
      })
    }
  }

  onPan = (dx: number, dy: number) => {
    this.setState({
      dx,
      dy
    })
  }
}
