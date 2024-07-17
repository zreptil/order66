import {Injectable} from '@angular/core';
import {EnvironmentService} from '@/_services/environment.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

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

  private header(token: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': token,
      'Content-Type': 'application/json'
    });
  }
}
