import {Injectable} from '@angular/core';
import {EnvironmentService} from '@/_services/environment.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PersonData} from '@/_model/person-data';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  token: string;

  constructor(public env: EnvironmentService,
              private http: HttpClient) {

  }

  query(body: any, token = this.token): Observable<any> {
    return this.http.post(`${this.env.backendUrl}`, body,
      {headers: this.header(token)});
  }

  loadPerson(onDone: (data: PersonData) => void, onError?: (error: any) => void): void {
    this.query({cmd: 'loadPerson'})
      .subscribe({
        next: (response: any) => {
          const person = new PersonData();
          console.log(response);
        },
        error: err => {
          console.error(err);
        }
      });
  }

  private header(token: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': token,
      'Content-Type': 'application/json'
    });
  }
}
