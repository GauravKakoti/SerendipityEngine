import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment';
import { OpoiService } from '../services/opoi/opoi.service';
import { MapboxService } from '../services/mapbox/mapbox.service';
import { StoreService } from '../services/store/store.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';
  @Input() city: any;
  coord: number[] = [4.351710, 50.850340]; //long, lat
  bearing: number = 0; //angle

  constructor(
    private opoi: OpoiService,
    private mapboxService: MapboxService,
    public store : StoreService,
  ) { }

  ngOnInit() {
    this.coord = this.city.center;

    (mapboxgl as any).accessToken = environment.mapbox.accessToken; // dirty 'accessToken read-only' workaround see: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/23467
      this.map = new mapboxgl.Map({
        container: 'map',
        style: this.style,
        zoom: 13,
        center: [this.coord[0], this.coord[1]],
        pitch: 0,//60, // pitch in degrees
        bearing: this.bearing, // bearing in degrees
    });

    this.map.on('load', () => {
      this.fitMap();
      this.bearing = this.mapboxService.calculate_bearing(this.store.selectedDestinationCity.center, this.store.selectedOriginCity.center);
      this.bearing += 180;
      this.bearing %= 360;
      this.map.setBearing(this.bearing);
    });

    // Add map controls
    this.map.addControl(new mapboxgl.NavigationControl());
    this.opoi.calculateTiles();
    //this.opoi.requestType("schema:CatholicChurch");
    this.opoi.requestType("schema:CatholicChurch").then(res => {console.log("schema:CatholicChurch:", res)});
    this.opoi.requestType("schema:Museum").then(res => {
      console.log("schema:Museum:", res);
      var coords = this.getCoords(res[0]["asWKT"]);
      this.addMarker(coords);
    });
  }

  exportMap() {
    console.log(this.map.getCanvas().toDataURL())
    var img = this.map.getCanvas().toDataURL(); //document.getElementById("map") "image/png"
    //document.write('<img src="'+ img +'"/>');
    var link = document.createElement('a');
    link.download = 'filename.png';
    link.href = img;//document.getElementById('canvas').toDataURL()
    link.click();
  }

  rotateMap(bearingAngle: number) {
    this.bearing += bearingAngle;
    this.bearing %= 360;
    this.map.setBearing(this.bearing);
  }

  fitMap() {
    var offset = 0.035;
    var p1: mapboxgl.PointLike = [this.city.bbox[0] - offset, this.city.bbox[1] - offset];
    var p2: mapboxgl.PointLike = [this.city.bbox[2] + offset, this.city.bbox[3] + offset];
    this.map.fitBounds([p1, p2]);
    this.bearing = 0;
  }

  addMarker(coord: number[]) {
    new mapboxgl.Marker()
      //.setLngLat({ lng: this.coord[0], lat: this.coord[1] })
      .setLngLat({ lng: coord[0], lat: coord[1] })
      .addTo(this.map);
  }

  getCoords(str: string): number[] {
    let regexp = /([0-9\.]+) ([0-9\.]+)/g;
    let res = str.match(regexp);
    var temp = res[0].split(' ');
    var arr: number[] = Array.from(temp).map(Number);
    //console.log("TEST ->", str, res, arr, temp);
    //arr.push(parseInt(res[0]), parseInt(res[1]));
    return arr;
  }

}
