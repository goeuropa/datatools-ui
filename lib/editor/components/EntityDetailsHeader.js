// @flow

import Icon from '@conveyal/woonerf/components/icon';
import React from 'react';
import { Badge, Button, ButtonGroup, Tooltip, OverlayTrigger, Nav, NavItem } from 'react-bootstrap';

import * as tripActions from '../actions/trip';
import * as activeActions from '../actions/active';
import * as mapActions from '../actions/map';
import { getEntityBounds, getEntityName } from '../util/gtfs';
import { entityIsNew } from '../util/objects';
import { GTFS_ICONS } from '../util/ui';

import type { Entity, Feed, GtfsRoute, GtfsStop, Pattern } from '../../types';
import type { MapState } from '../../types/reducers';
import type { EditorValidationIssue } from '../util/validation';
import type {AppState} from '../../types/reducers'

type RouteWithPatterns = { tripPatterns: Array<Pattern> } & GtfsRoute;

type Props = {
  activeComponent: string,
  activeEntity: Entity,
  activePattern: Pattern,
  activePatternStops: Array<GtfsStop>,
  editFareRules: boolean,
  entityEdited: boolean,
  feedSource: Feed,
  mapState: MapState,
  resetActiveGtfsEntity: typeof activeActions.resetActiveGtfsEntity,
  saveActiveGtfsEntity: typeof activeActions.saveActiveGtfsEntity,
  setActiveEntity: typeof activeActions.setActiveEntity,
  subComponent: string,
  subEntity: number,
  toggleEditFareRules: boolean => void,
  updateMapSetting: typeof mapActions.updateMapSetting,
  validationErrors: Array<EditorValidationIssue>,
};

function EntityDetailsHeader(props: Props) {
  const params = extractParamsFromURL();
  // Iterate over the parameters
/*  Object.keys(params).forEach((paramName) => {
    const paramValue = params[paramName];
    console.log(`${paramName}: ${paramValue}`);
  });*/

  function extractParamsFromURL() {
    const url = window.location.href;
    const params = {};

    // Split the URL by '/'
    const parts = url.split('/');

    // Find the index of the route parameter
    const routeIndex = parts.indexOf('route');

    // Extract the feedId and routeId from the URL parts
    if (routeIndex !== -1 && routeIndex + 2 < parts.length) {
      params.feedId = parts[routeIndex - 2];
      params.routeId = parts[routeIndex + 1];
    }

    return params;
  }

  const onClickSave = () => {
    if (props.subComponent === 'trippattern') {
      props.saveActiveGtfsEntity('trippattern');
    } else {
      props.saveActiveGtfsEntity(props.activeComponent);
    }
  };

  // TODO endpoint to number
  const onClickPdf = (r, state: AppState) => {
    console.warn('Here we ll generate pdf on this click for all lines');
    console.log(r);
    console.log('test');
    console.log(params.routeId);
    //console.log(params);
    const url = '/api/manager/secure/status/number/'+params.routeId;
    let {token} = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkREeDlIZlYxU3doU2ZBZHdrOXlpdCJ9.eyJodHRwOi8vZGF0YXRvb2xzL3VzZXJfbWV0YWRhdGEiOnt9LCJodHRwOi8vZGF0YXRvb2xzL2FwcF9tZXRhZGF0YSI6eyJkYXRhdG9vbHMiOlt7InBlcm1pc3Npb25zIjpbeyJ0eXBlIjoiYWRtaW5pc3Rlci1hcHBsaWNhdGlvbiJ9XSwic3Vic2NyaXB0aW9ucyI6W10sInByb2plY3RzIjpbXSwiY2xpZW50X2lkIjoic3NWU1NkT3h5aUhQb3BhSDBiWFVGem9lZ0h6YTVYUVoifSx7InBlcm1pc3Npb25zIjpbeyJ0eXBlIjoiYWRtaW5pc3Rlci1hcHBsaWNhdGlvbiJ9XSwic3Vic2NyaXB0aW9ucyI6W10sInByb2plY3RzIjpbXSwiY2xpZW50X2lkIjoiYndBeDduVjdwZGx0UnB3dDhuOFI3Z3JmbUNQOU53ejMifV19LCJuaWNrbmFtZSI6ImdyemVnb3J6LnBhdHluZWsiLCJuYW1lIjoiZ3J6ZWdvcnoucGF0eW5la0Bnb2V1cm9wYS5ldSIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci9kYjI4MDQxMDc4M2Q3NDFjN2YzNjVlYTc3YTNmZjc5ZD9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRmdyLnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIzLTA3LTE5VDE3OjUzOjE5LjAyNVoiLCJlbWFpbCI6ImdyemVnb3J6LnBhdHluZWtAZ29ldXJvcGEuZXUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vZ29ldXJvcGFwb2xza2EuZXUuYXV0aDAuY29tLyIsImF1ZCI6InNzVlNTZE94eWlIUG9wYUgwYlhVRnpvZWdIemE1WFFaIiwiaWF0IjoxNjg5Nzg5MjAxLCJleHAiOjE2ODk4MjUyMDEsInN1YiI6ImF1dGgwfDY0MDVlYjI0ZGZhMWMxNjAxZTg2MTU4MyIsInNpZCI6Ikd4NGhFZGhJX25ZU0NDTFg0SFNBM1lCVDRXZnkzOTRnIiwibm9uY2UiOiJSV3N3VUhOeU1qaHNSa011ZEVFek1UZDZTVU5tU21vMFVHbHlNM2hxV0hKTWN6aE5iRVkwV0M1aFdBPT0ifQ.iLxv_sScDB6EyJ4BYdoxLLrvSWZ-OOeDCmWoW1vqpkg7XZeXQWxXkdpp1fhwzA_HrHyT-i6KI3WftPFCqqdHZENmqr917zqBgbU3ep8HkPnQRXKEDwAMKFilDUeQzHwjdWH5ZGcxtLJQqi0cMdXhvxP-O1EltSMiH2ZotajYXWBVvRfPvxn9sp91ysfdaWjDz6pYOg_jcrkVg5iGVYCJM9tR__6hmpvqHLzAfaxOnHvT_35rcEytDwLWwGd6JLThVPOmP7Z5aPc5qJwgfM7izdSnlpWMTq5P1DfmctsAHAr8x5gCCRo256dMOGb1B9P_aZM-MtGSncfX26GcQW6SyQ"
    // FIXME What if authentication is turned off.
    if (!token) {
      console.warn('Cannot fetch without user token.')
      token = 'no_auth'
    }
    const headers: {[string]: string} = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
    console.log("token");
    console.log(token);
    if (isJSON) {
      headers['Content-Type'] = 'application/json'
    }
    //const body = payload && isJSON
    //  ? JSON.stringify(payload)
    //  : payload
    console.log("fetch headers3");
    console.log(headers);
    fetch(url, {method, headers, mode: 'cors'})
    .then((response) => response.json())
    .then((data) => {
      // Extract the Base64-encoded PDF data from the JSON response

      console.log('decode');
  const pdfData = data.pdfData;
    const decodedPdfData = atob(pdfData);
    const byteNumbers = new Array(decodedPdfData.length);
    for (let i = 0; i < decodedPdfData.length; i++) {
      byteNumbers[i] = decodedPdfData.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
  a.href = url;
  a.download = params.routeId + '_rozklad20230518.pdf';
  a.click();

      // Cleanup: Revoke the temporary URL
      URL.revokeObjectURL(url);
    })
    .catch((error) => {
      // Handle any errors that occur here
      console.error(error);
    });

/*
    //TODO test call
    const url2 = `${SECURE_API_PREFIX}gtfs/graphql2`;
    fetch(url2)
    .then((response) => response.json())
    .then((data) => {
      //just call
    })
    .catch((error) => {
      // Handle any errors that occur here
      console.error(error);
    });*/
  };

  const onClickUndo = () => {
    const {
      activeComponent,
      activeEntity,
      activePattern,
      resetActiveGtfsEntity,
      subComponent,
    } = props;
    if (subComponent === 'trippattern') {
      const castedRoute = (activeEntity: any);
      const pattern = castedRoute.tripPatterns.find((p) => p.id === activePattern.id);
      if (pattern) resetActiveGtfsEntity({ entity: pattern, component: 'trippattern' });
      else console.warn(`Could not locate pattern with id=${activePattern.id}`);
    } else {
      resetActiveGtfsEntity({ entity: activeEntity, component: activeComponent });
    }
  };

  const onClickZoomTo = () => {
    const { activeEntity, activePatternStops, subEntity, updateMapSetting } = props;
    let props;
    if (subEntity) {
      const castedRoute = (activeEntity: any);
      const pattern = castedRoute.tripPatterns.find((p) => p.id === subEntity);
      props = { bounds: getEntityBounds(pattern, activePatternStops), target: subEntity };
    } else {
      props = { bounds: getEntityBounds(activeEntity), target: +activeEntity.id };
    }
    updateMapSetting(props);
  };

  const showFareAttributes = () => props.toggleEditFareRules(false);

  const showFareRules = () => props.toggleEditFareRules(true);

  const showRoute = () => {
    const {
      activeComponent,
      activeEntity,
      feedSource,
      setActiveEntity,
      subComponent,
    } = props;
    if (subComponent === 'trippattern') {
      setActiveEntity(feedSource.id, activeComponent, activeEntity);
    }
  };

  const showTripPatterns = () => {
    const {
      activeComponent,
      activeEntity,
      feedSource,
      setActiveEntity,
      subComponent,
    } = props;
    if (subComponent !== 'trippattern') {
      setActiveEntity(feedSource.id, activeComponent, activeEntity, 'trippattern');
    }
  };

  const {
    activeComponent,
    activeEntity,
    editFareRules,
    entityEdited,
    mapState,
    subComponent,
    subEntity,
    validationErrors,
  } = props;
  const validationTooltip = (
    <Tooltip id="tooltip">
      {validationErrors.map((v, i) => (
        <p key={i}>
          {v.field}: {v.reason}
        </p>
      ))}
    </Tooltip>
  );
  const hasErrors = validationErrors.length > 0;
  const entityName =
    activeComponent === 'feedinfo' ? 'Feed Info' : getEntityName(activeEntity);
  const icon = GTFS_ICONS.find((i) => i.id === activeComponent);
  const zoomDisabled =
    activeEntity && !subComponent
      ? mapState.target === activeEntity.id
      : mapState.target === subEntity;
  const iconName = icon ? icon.icon : null;
  const nameWidth =
    activeComponent === 'stop' || activeComponent === 'route'
      ? '176px'
      : '210px';
      return (
        <div className="entity-details-header">
          <h5 className="entity-details-heading">
            {/* Zoom, undo, and save buttons */}
            <ButtonGroup className="pull-right">
              {(activeComponent === 'stop' || activeComponent === 'route') && (
                <OverlayTrigger
                  rootClose
                  placement="bottom"
                  overlay={<Tooltip id="tooltip">Zoom to {activeComponent}</Tooltip>}
                >
                  <Button bsSize="small" disabled={zoomDisabled} onClick={onClickZoomTo}>
                    <Icon type="search" />
                  </Button>
                </OverlayTrigger>
              )}
              <OverlayTrigger
                rootClose
                placement="bottom"
                overlay={<Tooltip id="tooltip">Undo changes</Tooltip>}
              >
                <Button bsSize="small" disabled={!entityEdited} onClick={onClickUndo}>
                  <Icon type="undo" />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger
                rootClose
                placement="bottom"
                overlay={<Tooltip id="tooltip">Save changes</Tooltip>}
              >
                <Button
                  bsSize="small"
                  data-test-id="save-entity-button"
                  disabled={!entityEdited || hasErrors}
                  onClick={onClickSave}
                >
                  <Icon type="floppy-o" />
                </Button>
              </OverlayTrigger>
              {activeComponent === 'route' && (<OverlayTrigger
                rootClose
                placement="bottom"
                overlay={<Tooltip id="tooltip">PDF</Tooltip>}
              >
                <Button bsSize="small" data-test-id="save-entity-button" onClick={() => onClickPdf(6)}>
                  <Icon type="file-pdf-o" />
                </Button>
              </OverlayTrigger>
              )}
            </ButtonGroup>
            <span className="entity-details-title" style={{ width: nameWidth }}>
              {/* Entity Icon */}
              <span style={{ position: 'relative', top: '-4px' }}>
                {activeComponent === 'route' ? (
                  <span className="fa-stack">
                    <Icon
                      type="square"
                      style={{ color: `#${activeEntity.route_color || 'fff'}` }}
                      className="fa-stack-2x"
                    />
                    <Icon
                      type="bus"
                      style={{ color: `#${activeEntity.route_text_color || '000'}` }}
                      className="fa-stack-1x"
                    />
                  </span>
                ) : iconName ? (
                  <span className="fa-stack">
                    <Icon type="square" className="fa-stack-2x" />
                    <Icon type={iconName} className="fa-inverse fa-stack-1x" />
                  </span>
                ) : (
                  // schedule exception icon if no icon found
                  <span className="fa-stack">
                    <Icon type="calendar" className="fa-stack-1x" />
                    <Icon type="ban" className="text-danger fa-stack-2x" />
                  </span>
                )}
              </span>
              {'  '}
              {/* Entity name */}
              <span title={entityName} className="entity-details-name">
                {entityName}
              </span>
            </span>
          </h5>
          {/* Validation issues */}
          <p style={{ marginBottom: '2px' }}>
            <small style={{ marginTop: '3px' }} className="pull-right">
              <em className="text-muted">* denotes required field</em>
            </small>
            <small className={`${hasErrors ? ' text-danger' : ' text-success'}`}>
              {hasErrors ? (
                <span>
                  <Icon type="times-circle" />
                  {' '}
                  Fix
                  {' '}
                  <OverlayTrigger placement="bottom" overlay={validationTooltip}>
                    <span style={{ borderBottom: '1px dotted #000' }}>
                      {validationErrors.length} validation issue(s)
                    </span>
                  </OverlayTrigger>
                </span>
              ) : (
                <span>
                  <Icon type="check-circle" /> No validation issues
                </span>
              )}
            </small>
          </p>
          <div className="clearfix" />
          {activeComponent === 'route' && (
            <Nav style={{ marginBottom: '5px' }} bsStyle="pills" justified>
              <NavItem
                eventKey={'route'}
                active={subComponent !== 'trippattern'}
                onClick={showRoute}
              >
                Route details
              </NavItem>
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tooltip">Trip patterns define a route&rsquo;s unique stop sequences and timings.</Tooltip>}
              >
                <NavItem
                  active={subComponent === 'trippattern'}
                  data-test-id="trippattern-tab-button"
                  disabled={!activeEntity || entityIsNew(activeEntity)}
                  eventKey={'trippattern'}
                  onClick={showTripPatterns}
                >
                  Trip patterns
                  <Badge>{activeEntity.tripPatterns ? activeEntity.tripPatterns.length : 0}</Badge>
                </NavItem>
              </OverlayTrigger>
            </Nav>
          )}
          {activeComponent === 'fare' && (
            <Nav style={{ marginBottom: '5px' }} bsStyle="pills" justified>
              <NavItem
                active={!editFareRules}
                data-test-id="fare-attributes-tab-button"
                eventKey={'fare'}
                onClick={showFareAttributes}
              >
                Attributes
              </NavItem>
              <NavItem
                active={editFareRules}
                data-test-id="fare-rules-tab-button"
                disabled={!activeEntity || entityIsNew(activeEntity)}
                eventKey={'rules'}
                onClick={showFareRules}
              >
                Rules
              </NavItem>
            </Nav>
          )}
        </div>
      );
    };

export default EntityDetailsHeader;
