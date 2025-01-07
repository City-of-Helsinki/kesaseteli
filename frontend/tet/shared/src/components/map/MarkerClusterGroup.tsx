import { createPathComponent } from '@react-leaflet/core';

import * as L from 'leaflet';

require('leaflet.markercluster');

const MarkerClusterGroup = createPathComponent(
  ({ children, ...props }, context) => {
    const clusterProps = {};
    const clusterEvents = {};

    Object.entries(props).forEach(([propName, prop]) =>
      propName.startsWith('on')
        ? (clusterEvents[propName] = prop)
        : (clusterProps[propName] = prop)
    );

    const markerClusterGroup = L.markerClusterGroup(clusterProps);

    Object.entries(clusterEvents).forEach(([eventAsProp, callback]) => {
      const clusterEvent = `${eventAsProp.substring(2).toLowerCase()}`;

      markerClusterGroup.on(clusterEvent as any, callback as any);
    });

    return {
      instance: markerClusterGroup,
      context: { ...context, layerContainer: markerClusterGroup },
    };
  }
);

export default MarkerClusterGroup;
