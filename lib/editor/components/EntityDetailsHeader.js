import Icon from '@conveyal/woonerf/components/icon';
import React from 'react';
import { Badge, Button, ButtonGroup, Tooltip, OverlayTrigger, Nav, NavItem } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

import * as tripActions from '../actions/trip';
import * as activeActions from '../actions/active';
import * as mapActions from '../actions/map';
import { getEntityBounds, getEntityName } from '../util/gtfs';
import { entityIsNew } from '../util/objects';
import { GTFS_ICONS } from '../util/ui';

import type { Entity, Feed, GtfsRoute, GtfsStop, Pattern } from '../../types';
import type { MapState } from '../../types/reducers';
import type { EditorValidationIssue } from '../util/validation';

type RouteWithPatterns = { tripPatterns: Array<Pattern> } & GtfsRoute;

type Props = {
  activeComponent: string;
  activeEntity: Entity;
  activePattern: Pattern;
  activePatternStops: Array<GtfsStop>;
  editFareRules: boolean;
  entityEdited: boolean;
  feedSource: Feed;
  mapState: MapState;
  resetActiveGtfsEntity: typeof activeActions.resetActiveGtfsEntity;
  saveActiveGtfsEntity: typeof activeActions.saveActiveGtfsEntity;
  setActiveEntity: typeof activeActions.setActiveEntity;
  subComponent: string;
  subEntity: number;
  toggleEditFareRules: boolean => void;
  updateMapSetting: typeof mapActions.updateMapSetting;
  validationErrors: Array<EditorValidationIssue>;
};

const EntityDetailsHeader = (props: Props) => {
  const {
    activeComponent,
    activeEntity,
    activePattern,
    activePatternStops,
    editFareRules,
    entityEdited,
    feedSource,
    mapState,
    resetActiveGtfsEntity,
    saveActiveGtfsEntity,
    setActiveEntity,
    subComponent,
    subEntity,
    toggleEditFareRules,
    updateMapSetting,
    validationErrors,
  } = props;

  const { route } = useParams();

  const onClickSave = () => {
    if (subComponent === 'trippattern') {
      saveActiveGtfsEntity('trippattern');
    } else {
      saveActiveGtfsEntity(activeComponent);
    }
  };

  const onClickPdf = () => {
    console.warn('Here we ll generate pdf on this click for all lines');
    console.log({ route });
    const url = `/api/manager/secure/status/number/4`; //+ params.route;
    fetch(url)
      .then(response => response.text())
      .then(data => {
        console.log('returned');
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      });
  };

  const onClickUndo = () => {
    if (subComponent === 'trippattern') {
      if ('tripPatterns' in activeEntity) {
        const pattern = activeEntity.tripPatterns.find(p => p.id === activePattern.id);
        if (pattern) {
          resetActiveGtfsEntity({ entity: pattern, component: 'trippattern' });
        } else {
          console.warn(`Could not locate pattern with id=${activePattern.id}`);
        }
      } else {
        console.warn('Invalid activeEntity type for subComponent="trippattern"');
      }
    } else {
      resetActiveGtfsEntity({ entity: activeEntity, component: activeComponent });
    }
  };


  const onClickZoomTo = () => {
    let props;
    if (subEntity) {
    };

const renderBadge = () => {
const { validationErrors } = props;

kotlin

if (validationErrors && validationErrors.length > 0) {
return (
  <Badge>
    {validationErrors.length}{' '}
    {validationErrors.length === 1 ? 'Error' : 'Errors'}
  </Badge>
);
}

return null;

};

const renderBadgeAndButtons = () => {
if (activeComponent === 'fare' || activeComponent === 'route' || activeComponent === 'stop') {
return (
<div>
{renderBadge()}
<ButtonGroup className="pull-right">
{renderZoomToButton()}
{renderSaveButton()}
{renderUndoButton()}
{renderEditFareRulesButton()}
{renderPdfButton()}
</ButtonGroup>
</div>
);
}
return null;
};
return (

<Nav bsStyle="pills">
  <NavItem
    active={subComponent === 'trippattern'}
    href={`#/feed/${feedSource.id}/route/${route}/trippatterns`}
    onClick={() => setActiveEntity({ entity: activeEntity, component: 'route' })}
  >
    <Icon type={GTFS_ICONS.patterns} />
    {' Trip Patterns'}
  </NavItem>
  <NavItem
    active={subComponent === 'stop'}
    href={`#/feed/${feedSource.id}/route/${route}/stops`}
    onClick={() => setActiveEntity({ entity: activeEntity, component: 'route' })}
  >
    <Icon type={GTFS_ICONS.stops} />
    {' Stops'}
  </NavItem>
  <NavItem
    active={subComponent === 'fare'}
    href={`#/feed/${feedSource.id}/route/${route}/fares`}
    onClick={() => setActiveEntity({ entity: activeEntity, component: 'route' })}
  >
    <Icon type={GTFS_ICONS.fares} />
    {' Fares'}
  </NavItem>
  {renderBadgeAndButtons()}
</Nav>

);
};

export default EntityDetailsHeader;
