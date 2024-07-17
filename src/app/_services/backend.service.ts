import {Injectable} from '@angular/core';
import {EnvironmentService} from '@/_services/environment.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PersonData} from '@/_model/person-data';
import {Utils} from '@/classes/utils';
import {GLOBALS} from '@/_services/globals.service';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  token: string;
  remainingUsers: number;

  constructor(public env: EnvironmentService,
              private http: HttpClient) {

  }

  /**
   * Register a new user and save the data for the person
   * @param username username
   * @param pwd      password
   * @param person   data for the person to save
   * @param onDone   called when done
   * @param onError  called on error during processing
   */
  register(username: string, pwd: string, person: PersonData, onDone: (person: PersonData) => void, onError?: (error: any) => void): void {
    Utils.hash(pwd).then((hash: string) => {
      this.query({data: person.forBackend}, `register|${username}|${hash}`)
        .subscribe({
          next: response => {
            // save token for future requests without login-data
            this.token = response.u.token;
            person = new PersonData();
            person.fillFromBackend(response.p);
            onDone?.(person);
          },
          // request to login was rejected
          error: error => {
            onError?.(error);
          }
        })
    });
  }

  /**
   * Login to the backend.
   * @param username username
   * @param pwd      password
   * @param onDone   called when done
   * @param onError  called on error during processing
   */
  login(username: string, pwd: string, onDone: (person: PersonData) => void, onError?: (error: any) => void): void {
    Utils.hash(pwd).then((hash: string) => {
      this.query({}, `auth|${username}|${hash}`)
        .subscribe({
          next: response => {
            // save token for future requests without login-data
            this.token = response.u.token;
            this.loadPerson((data) => {
              onDone?.(data);
            });
          },
          // request to login was rejected
          error: error => {
            onError?.(error);
          }
        })
    });
  }

  loginByToken(onDone: (data: any) => void, onError?: (error: any) => void): void {
    this.query({cmd: 'loadPerson'}, this.token)
      .subscribe({
        next: response => {
          onDone?.(response);
        },
        // request to login was rejected
        error: error => {
          this.remainingUsers = +(error?.error?.r);
          onError?.(error);
        }
      })
  }

  loadPerson(onDone: (data: PersonData) => void, onError?: (error: any) => void): void {
    this.query({cmd: 'loadPerson'})
      .subscribe({
        next: (response: any) => {
          console.log('antwort!!!!', response);
          const person = new PersonData();
          person.fillFromBackend(response.person.data);
          console.log(response.person.data);
          onDone(person);
        },
        error: error => {
          console.error(error);
          onError?.(error);
        }
      });
  }

  logout(): void {
    this.token = null;
    GLOBALS.person = null;
    GLOBALS.saveSharedData();
  }

  private query(body: any, token = this.token): Observable<any> {
    return this.http.post(`${this.env.backendUrl}`, body,
      {headers: this.header(token)});
  }

  private header(token: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': token ?? '',
      'Content-Type': 'application/json'
    });
  }
}
