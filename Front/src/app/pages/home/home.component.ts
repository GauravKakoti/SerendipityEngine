import { Component, OnInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Transport } from 'src/app/utilitaries/transport-enum';
import { MapboxService, Feature} from '../../services/mapbox/mapbox.service'
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  form : FormGroup;
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;

  selectedTransport : Transport;
  cities: string[] = []; // List of cities based on partial search string
  selectedCity = null;
  control = new FormControl();

  waysOfTransports = [
    { id : Transport.Car, label : "by car",  picture : "car" },
    { id : Transport.Bicycle, label : "by bicycle",  picture : "bicycle" },
    { id : Transport.Foot, label : "by foot",  picture : "foot" },
    { id : Transport.Other, label : "other",  picture : "foot" },
  ]

  constructor(private formBuilder: FormBuilder, private mapboxService: MapboxService) {

    // this.form = this.formBuilder.group({
    //   city: ['',[Validators.required,  Validators.maxLength(50),  Validators.minLength(1)]],
    // });

    this.form = this.formBuilder.group({
      city: ['',[Validators.required,  Validators.maxLength(50),  Validators.minLength(1)]],
    });
    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
    this.thirdFormGroup = this.formBuilder.group({
      secondCtrl: ['', Validators.required]
    });

   }

  ngAfterViewInit() {
    document.getElementById('main-container').style.height = (window.innerHeight - document.getElementsByTagName("header")[0].offsetHeight - document.getElementsByTagName("footer")[0].offsetHeight) + "px";
  }

  changeSelectedTransport(value) {
    this.selectedTransport = value;
  }


  searching() {
    console.log(this.form.value["city"]);
  }

  ngOnInit() {
    //this.control.valueChanges.toPromise().then(ev => {console.log('AAA'); this.search(ev)});
  }

  search(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm && searchTerm.length > 0) {
      this.mapboxService
        .search_word(searchTerm)
        .subscribe((features: Feature[]) => {
          this.cities = features.map(feat => feat.place_name);
        });
    }
    else {
      this.cities = [];
    }
  }

  onSelect(address: string) {
    console.log(address + " is selected");
    this.selectedCity = address;
    this.cities = [];
  }

}
