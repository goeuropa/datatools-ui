// @flow

import React, { Component } from 'react'
import { Button, Grid, Row, Col } from 'react-bootstrap'
import {Link} from 'react-router'
import {LinkContainer} from 'react-router-bootstrap'

import { DEFAULT_DESCRIPTION, DEFAULT_LOGO, DEFAULT_TITLE } from '../../common/constants'
import { getConfigProperty, isModuleEnabled } from '../../common/util/config'
import PublicPage from './PublicPage'

import type {Props as ContainerProps} from '../containers/ActivePublicLandingPage'
import type {ManagerUserState} from '../../types/reducers'

type Props = ContainerProps & {
  user: ManagerUserState
}

export default class PublicLandingPage extends Component<Props> {
  render () {
    const appTitle = getConfigProperty('application.title') || DEFAULT_TITLE
    const appDescription = getConfigProperty('application.description') || DEFAULT_DESCRIPTION
    const logoLarge = getConfigProperty('application.logo_large') || DEFAULT_LOGO
    return (
      <PublicPage ref='publicPage'>
        <Grid>
          <Row>
            <Col style={{textAlign: 'center'}} smOffset={4} xs={12} sm={4}>
              <img alt='App logo' src={logoLarge} style={{maxWidth: '256px'}} />
              <h1>{appTitle}</h1>
            </Col>
          </Row>
          <Row>
            <Col style={{textAlign: 'center', marginTop: '15px'}} smOffset={4} xs={12} sm={4}>
              <p className='lead'>
                {this.props.user.profile
                  ? <LinkContainer to='/home'>
                    <Button bsSize='large'>
                      Zobacz panel
                    </Button>
                  </LinkContainer>
                  : <span>
                    {appDescription}
                  </span>
                }
              </p>
              {!isModuleEnabled('enterprise') && <p>
                Dowiedz się więcej o Data Tools{' '}
                <a href='https://www.ibigroup.com/products'>here</a>.
              </p>}
              <p>
                {!this.props.user.profile
                  ? <span>Istniejący użytkownicy <Link to='/login'>Logowanie tutaj</Link>.</span>
                  : null
                }
              </p>
            </Col>
          </Row>
        </Grid>
        <footer className='landing-footer'>
          <div className='container'>
            <p className='text-center text-muted'>
              <span role='img' title='Copyright' aria-label='copyright'>
                &copy;
              </span>{' '}
              <a href='https://www.goeuropa.eu'>GoEuropa</a>
            </p>
          </div>
        </footer>
      </PublicPage>
    )
  }
}
