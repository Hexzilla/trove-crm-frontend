import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DateService } from '../../../service/date.service'
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { filter, map, startWith, take, tap } from 'rxjs/operators';
import { SettingsApiService } from 'src/app/services/settings-api.service';
import * as moment from 'moment';

export interface ContactFilters {
  count: number
  status: string
  activity: number
  activityStartDate: Date
  activityEndDate: Date
  addedon: number
  addonStartDate: Date
  addonEndDate: Date
  owners: number[]
}
export interface ContactOwner {
  id: number;
  name: string;
  isChecked?: boolean;
}

@Component({
  selector: 'contact-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class ContactFilterComponent implements OnInit {
  @Input() companies: ContactOwner[] = [];
  @Output() closeDialog = new EventEmitter();
  @Output() notifyFilters = new EventEmitter<ContactFilters>();
  ownerFilterCtrl = new FormControl();
  ownerFilterObserver: Observable<ContactOwner[]>;
  selectedOwners: ContactOwner[] = [];
  statusTypes: string[] = ['All', 'Active', 'Inactive']
  scrollOptions = { autoHide: true, scrollbarMinSize: 50 }
  filters: ContactFilters = {
    count: 0, 
    status: null, 
    activity: -1,
    activityStartDate: null,
    activityEndDate: null,
    addedon: -1,
    addonStartDate: null,
    addonEndDate: null,
    owners: [],
  }
  dateFormat = 'DD/MM/YYYY'

  filterByOwner(item: ContactOwner){
    if (item.isChecked) {
      this.selectedOwners = [...this.selectedOwners, item];
    }
    else {
      let index = this.selectedOwners.findIndex(c => c.name === item.name);
      this.selectedOwners.splice(index, 1);
    }
    this.filters.owners = this.selectedOwners.map(s => s.id)
    this.notify()
  }

  dateTypes: number[] = [0, 1, 2, 3, 4, 5, 6]
  dateTypeString: string[] = ['Today', 'Yesterday', 'Last Week', 'This month', 'Last month', 'This Quarter', 'Custom']
  dateType: number

  addDateTypes: number[] = [0, 1, 2, 3, 4, 5, 6]
  addDateTypeString: string[] = ['Today', 'Yesterday', 'Last Week', 'This month', 'Last month', 'This Quarter', 'Custom']


  constructor(
    private settingsApiService: SettingsApiService,
    private dateService: DateService) {
    this.ownerFilterObserver = this.ownerFilterCtrl.valueChanges
      .pipe(
        startWith(''),
        map(state => state ? this._filterStatesComp(state) : this.companies.slice())
      );

    console.log("this.filters", this.filters)
  }

  ngOnInit(): void {
    const format = this.settingsApiService.getDateFormat()
    this.dateFormat = this.dateService.getDateFormat(format)
  }

  dateToString(date): string {
    return moment(date).format(this.dateFormat)
  }

  public getSelectedDate() {
    if (this.filters.activity == -1) {
      return ''
    }
    if (this.filters.activity == 6) {
      let firstDay = '', lastDay = ''
      this.filters.activityStartDate && (firstDay = this.dateToString(this.filters.activityStartDate))
      this.filters.activityEndDate && (lastDay = this.dateToString(this.filters.activityEndDate))
      return firstDay + ' ~ ' + lastDay   
    }
    const {startDate, lastDate} = this.dateService.getDateRange(this.filters.activity)
    return this.dateToString(startDate) + ' ~ ' + this.dateToString(lastDate)
  }

  public getAddSelectedDate() {
    if (this.filters.addedon == -1) {
      return ''
    }
    if (this.filters.activity == 6) {
      let firstDay = '', lastDay = ''
      this.filters.addonStartDate && (firstDay = this.dateToString(this.filters.addonStartDate))
      this.filters.addonEndDate && (lastDay = this.dateToString(this.filters.addonEndDate))
      return firstDay + ' ~ ' + lastDay   
    }
    const {startDate, lastDate} = this.dateService.getDateRange(this.filters.addedon)
    return this.dateToString(startDate) + ' ~ ' + this.dateToString(lastDate)
  }

  calculateFilterCount(): number {
    let filterCount = 0;
    if (this.filters.status) {
      filterCount += 1;
    }
    if (this.selectedOwners.length > 0) {
      filterCount += 1;
    }
    if (this.filters.activity != -1 && (this.filters.activity || this.filters.activity == 0)) {
      filterCount += 1;
    }
    if (this.filters.addedon != -1 && (this.filters.addedon || this.filters.addedon == 0)) {
      filterCount += 1;
    }
    return filterCount;
  }

  clearAll() {
    this.clearStatus();
    this.clearOwner();
    this.clearDate();
    this.clearAddDate();
  }

  public clearStatus() {
    this.filters.status = null;
    this.notify()
  }

  public clearOwner() {
    this.selectedOwners = [];
    this.filters.owners = []
    this.ownerFilterCtrl.setValue('')
    this.ownerFilterObserver.pipe(
      tap(data => {
        data.forEach(c => {
          c.isChecked = false;
        })
      }),
      take(1)
    ).subscribe();
    this.notify()
  }

  public clearDate() {
    this.filters.activity = -1
    this.notify()
  }

  public clearAddDate() {
    this.filters.addedon = -1
    this.notify()
  }

  public stateFilterChanged(e) {
    console.log('stateFilterChanged', e)
    this.filters.status = e.value
    this.notify()
  }

  public activityFilterChanged(e) {
    console.log('activityFilterChanged', e)
    this.filters.activity = e.value
    this.notify()
  }

  public addedonFilterChanged(e) {
    console.log('addedonFilterChanged', e)
    this.filters.addedon = e.value
    this.notify()
  }

  public notify() {
    this.filters.count = this.calculateFilterCount()
    this.notifyFilters.emit(this.filters);
  }

  public closeFilterDilaog() {
    this.closeDialog.emit(this.filters)
  }

  private _filterStatesComp(value: string): ContactOwner[] {
    const filterValue = value.toLowerCase();
    return this.companies.filter(state => state.name.toLowerCase().indexOf(filterValue) === 0);
  }
}

