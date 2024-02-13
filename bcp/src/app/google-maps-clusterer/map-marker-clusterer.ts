/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="google.maps" />

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { GoogleMap } from '@angular/google-maps';
import { MapEventManager, MapMarker } from '@angular/google-maps';
import { MarkerClusterer, MarkerClustererOptions } from '@googlemaps/markerclusterer'

/**
 * Angular component for implementing a Google Maps Marker Clusterer.
 *
 * See https://developers.google.com/maps/documentation/javascript/marker-clustering
 */
@Component({
  selector: 'new-map-marker-clusterer',
  exportAs: 'mapMarkerClusterer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  encapsulation: ViewEncapsulation.None,
})
export class MapMarkerClusterer implements OnInit, AfterContentInit, OnDestroy {
  private readonly _currentMarkers = new Set<google.maps.Marker>();
  private readonly _closestMapEventManager = new MapEventManager(this._ngZone);
  private _markersSubscription = Subscription.EMPTY;
  private _apiSubscription = Subscription.EMPTY;

  /** Whether the clusterer is allowed to be initialized. */
  private readonly _canInitialize: boolean;

  /**
   * Used to trigger the creation of the cluster
   * Should be linked to when the API is loaded
   */
  @Input()
  apiInitialized: Observable<void>;

  /**
   * Used to customize how the marker cluster is created.
   * See https://googlemaps.github.io/js-markerclusterer/interfaces/MarkerClusterOptions.html.
   */
  @Input()
  options: MarkerClustererOptions;

  /** Emits when clustering has started. */
  @Output() readonly clusteringbegin: Observable<void> =
    this._closestMapEventManager.getLazyEmitter<void>('clusteringbegin');

  /** Emits when clustering is done. */
  @Output() readonly clusteringend: Observable<void> =
    this._closestMapEventManager.getLazyEmitter<void>('clusteringend');


  @ContentChildren(MapMarker, {descendants: true}) _markers: QueryList<MapMarker>;

  /** Underlying MarkerClusterer object used to interact with Google Maps. */
  markerClusterer?: MarkerClusterer;

  constructor(private readonly _googleMap: GoogleMap, private readonly _ngZone: NgZone) {
    this._canInitialize = this._googleMap._isBrowser;
  }

  ngOnInit() {
    this._apiSubscription = this.apiInitialized.subscribe(_ => {
      if (this._canInitialize) {
        this._createCluster();
        this._watchForMarkerChanges();

        // The `clusteringbegin` and `clusteringend` events are
        // emitted on the map so that's why set it as the target.
        this._closestMapEventManager.setTarget(this._googleMap.googleMap!);
      }
    })
  }

  ngAfterContentInit() {
    if (this._canInitialize && 'google' in window && typeof google === 'object' && typeof google.maps === 'object') {
      this._createCluster();
      this._watchForMarkerChanges();
    }
  }

  ngOnDestroy() {
    this._markersSubscription.unsubscribe();
    this._closestMapEventManager.destroy();
    this._apiSubscription.unsubscribe();
    this._destroyCluster();
  }

  private _watchForMarkerChanges() {
    this._assertInitialized();
    const initialMarkers: google.maps.Marker[] = [];
    for (const marker of this._getInternalMarkers(this._markers.toArray())) {
      this._currentMarkers.add(marker);
      initialMarkers.push(marker);
    }
    this.markerClusterer.addMarkers(initialMarkers);

    this._markersSubscription.unsubscribe();
    this._markersSubscription = this._markers.changes.subscribe((markerComponents: MapMarker[]) => {
      this._assertInitialized();
      const newMarkers = new Set<google.maps.Marker>(this._getInternalMarkers(markerComponents));
      const markersToAdd: google.maps.Marker[] = [];
      const markersToRemove: google.maps.Marker[] = [];
      for (const marker of Array.from(newMarkers)) {
        if (!this._currentMarkers.has(marker)) {
          this._currentMarkers.add(marker);
          markersToAdd.push(marker);
        }
      }
      for (const marker of Array.from(this._currentMarkers)) {
        if (!newMarkers.has(marker)) {
          markersToRemove.push(marker);
        }
      }
      this.markerClusterer.addMarkers(markersToAdd, true);
      this.markerClusterer.removeMarkers(markersToRemove, true);
      this.markerClusterer.render();
      for (const marker of markersToRemove) {
        this._currentMarkers.delete(marker);
      }
    });
  }

  private _createCluster() {

    this._destroyCluster();

    // Create the object outside the zone so its events don't trigger change detection.
    // We'll bring it back in inside the `MapEventManager` only for the events that the
    // user has subscribed to.
    this._ngZone.runOutsideAngular(() => {
      this.options.map = this._googleMap.googleMap
      this.markerClusterer = new MarkerClusterer(this.options);
    });
  }

  private _destroyCluster() {
    // TODO(crisbeto): the naming here seems odd, but the `MarkerCluster` method isn't
    // exposed. All this method seems to do at the time of writing is to call into `reset`.
    // See: https://github.com/googlemaps/js-markerclusterer/blob/main/src/markerclusterer.ts#L205
    this.markerClusterer?.onRemove();
    this.markerClusterer = undefined;
  }

  private _getInternalMarkers(markers: MapMarker[]): google.maps.Marker[] {
    return markers
      .filter(markerComponent => !!markerComponent.marker)
      .map(markerComponent => markerComponent.marker!);
  }

  private _assertInitialized(): asserts this is {markerClusterer: MarkerClusterer} {
    if (!this._googleMap.googleMap) {
      throw Error(
        'Cannot access Google Map information before the API has been initialized. ' +
          'Please wait for the API to load before trying to interact with it.',
      );
    }
    if (!this.markerClusterer) {
      throw Error(
        'Cannot interact with a MarkerClusterer before it has been initialized. ' +
          'Please wait for the MarkerClusterer to load before trying to interact with it.',
      );
    }
  }
}