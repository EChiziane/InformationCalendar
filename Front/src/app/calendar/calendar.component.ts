import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NgbDate} from '@ng-bootstrap/ng-bootstrap';


export interface Information {
  id: string,
  data: string,
  descricao: string;
}


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  model: NgbDate | null = null;
  informations: Information[] = [];
  displayedInformations: Information[] = [];
  showInput: boolean = false;
  info: string = '';
  message: string = '';
  datesWithInfo: Set<string> = new Set<string>();

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.getInformations();
    console.log(this.informations);
  }

  onDateSelect(date: NgbDate) {
    this.model = date;
    this.filterDaysBySelectedDate();
  }

  toggleInput() {
    this.showInput = !this.showInput;
    this.message = '';
  }

  listAllInformations() {
    this.model = null; // Reset the date selection
    this.displayedInformations = [...this.informations];
    this.message = '';
  }

  filterDaysBySelectedDate() {
    if (this.model) {
      const selectedDateStr = `${this.model.year}-${this.model.month}-${this.model.day}`;
      this.displayedInformations = this.informations.filter(info => info.data === selectedDateStr);
      this.message = this.displayedInformations.length ? '' : 'Não há nenhuma informação para este dia.';
    }
  }

  saveInfo() {
    if (this.model) {
      const dateStr = `${this.model.year}-${this.model.month}-${this.model.day}`;
      this.http.post('http://localhost:3000/api/informacao', {data: dateStr, descricao: this.info})
        .subscribe(
          (newInfo: any) => {
            this.info = '';
            this.informations.push(newInfo);
            this.datesWithInfo.add(dateStr); // Add date to the set
            this.filterDaysBySelectedDate();
            alert('Informação salva com sucesso!');
          },
          error => {
            console.error('Erro ao salvar informação:', error);
            alert('Erro ao salvar informação. Verifique o console para mais detalhes.');
          }
        );
    }
  }

  getInformations() {
    this.http.get<Information[]>('http://localhost:3000/api/informacao').subscribe({
      next: (data) => {
        this.informations = data;
        this.displayedInformations = [...this.informations];
        // Add all dates with information to the set
        data.forEach(info => {
          this.datesWithInfo.add(info.data);
        });
      },
      error: (error) => {
        console.error('Erro ao buscar informações:', error);
      }
    });
  }

  isMarked(date: NgbDate): boolean {
    const dateStr = `${date.year}-${date.month}-${date.day}`;
    return this.datesWithInfo.has(dateStr);
  }

  isSelected(date: NgbDate): any {
    return this.model && this.model.year === date.year && this.model.month === date.month && this.model.day === date.day;
  }
}
