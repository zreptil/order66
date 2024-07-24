import {Injectable} from '@angular/core';
import {EnvironmentService} from '@/_services/environment.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Utils} from '@/classes/utils';
import {GLOBALS} from '@/_services/globals.service';
import {AppData} from '@/_model/app-data';
import {PersonData} from '@/_model/person-data';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  token: string;
  remainingUsers: number;
  serviceAvailable = true;

  constructor(public env: EnvironmentService,
              private http: HttpClient) {
  }

  may(_check: string): boolean {
    return true;
  }

  /**
   * Register a new user and save the data for the person
   * @param username username
   * @param pwd      password
   * @param type     usertype
   * @param data     data for saving
   * @param onDone   called when done
   * @param onError  called on error during processing
   */
  register(username: string, pwd: string, type: number, data: AppData, onDone: (data: AppData) => void, onError?: (error: any) => void): void {
    Utils.hash(pwd).then((hash: string) => {
      this.query({data: data.forBackend}, `register|${username}|${hash}|${type}`)
        .subscribe({
          next: response => {
            // save token for future requests without login-data
            this.token = response.u.token;
            // extract AppData from response and save the usertype
            const ret = new AppData();
            ret.fillFromBackend(response.d);
            ret.usertype = response.u.type;
            onDone?.(ret);
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
  login(username: string, pwd: string, onDone: (data: any) => void, onError?: (error: any) => void): void {
    Utils.hash(pwd).then((hash: string) => {
      this.query({}, `auth|${username}|${hash}`)
        .subscribe({
          next: response => {
            // save token for future requests without login-data
            this.token = response.u.token;
            this.loadAppData((data) => {
              onDone?.({data: data, perm: response.u.permissions, type: response.u.type});
            });
          },
          // request to login was rejected
          error: error => {
            onError?.(error);
          }
        });
    });
  }

  getSitterList(onDone: (data: PersonData[]) => void, onError?: (error: any) => void): void {
    this.query({cmd: 'loadSitterList'}, this.token)
      .subscribe({
        next: response => {
          const ret: PersonData[] = [];
          for (const src of response) {
            const dst = new AppData();
            dst.fillFromBackend(src.d.data);
            dst.person.fkUser = src.u;
            ret.push(dst.person);
          }
          onDone?.(ret);
        },
        // request to login was rejected
        error: error => {
          onError?.(error);
        }
      });
  }

  loginByToken(onDone: (data: any) => void, onError?: (error: any) => void): void {
    this.query({cmd: 'loadAppData', id: 1}, this.token)
      .subscribe({
        next: response => {
          this.remainingUsers = response.ru;
          onDone?.(response);
        },
        // request to login was rejected
        error: error => {
          this.remainingUsers = +(error?.error?.r);
          this.serviceAvailable = error?.error?.r != null;
          onError?.(error);
        }
      })
  }

  loadAppData(onDone: (data: AppData) => void, onError?: (error: any) => void): void {
    this.query({cmd: 'loadAppData', id: 1})
      .subscribe({
        next: (response: any) => {
          const ret = new AppData();
          ret.fillFromBackend(response.data);
          ret.permissions = response.perm.split(',');
          onDone(ret);
        },
        error: error => {
          console.error(error);
          onError?.(error);
        }
      });
  }

  saveAppData(data: AppData, onDone: (data: AppData) => void, onError?: (error: any) => void): void {
    // const list: any[] = [];
    // for (let i = 0; i < 10000; i++) {
    //   list.push(data.person);
    // }
    // (data as any).test = list;
    // console.log(data.forBackend);
//       $query = 'insert into plan (start, end) values ('
//         . forSql(20240711) . ',' . forSql(20240721) . ');'
//         . 'insert into plan (start, end) values ('
//         . forSql(20240808) . ',' . forSql(20240816) . ');';
//       $result = $userDb->exec($query);
//       $query = 'insert into textblock (type, text) values ('
//         . forSql(0) . ','
//         . forSql('Boots, Emma, Tyson und Marley bekommen zusammen eine ganze 400g Dose in ihren Schüsseln', true) . ');'
//         . 'insert into textblock (type, text) values ('
//         . forSql(0) . ','
//         . forSql('Für Ohneschwanz eine Aluschale vor die Eingangstüre stellen. Und wenn Felix da ist, eine Schale im Carport neben dem Igel-Holzhaus platzieren. Bitte die Schalen beim Gehen in den Restmüll schmeissen.', true) . ');'
//         . 'insert into textblock (type, text) values ('
//         . forSql(1) . ','
//         . forSql('Graue Restmülltonne rausstellen.', true) . ');'
//         . 'insert into textblock (type, text) values ('
//         . forSql(1) . ','
//         . forSql('Graue Restmülltonne reinstellen.', true) . ');'
//         . 'insert into textblock (type, text) values ('
//         . forSql(0) . ','
//         . forSql('Eier aus dem Stall rein holen.', true) . ');'
//         . 'insert into textblock (type, text) values ('
//         . forSql(0) . ','
//         . forSql('Bei den Hühnern im Aussengehege das Wasser auffüllen.', true) . ');'
//         . 'insert into textblock (type, text) values ('
//         . forSql(0) . ','
//         . forSql('Bei den Hühnern im Aussengehege das Wasser auffüllen.', true) . ');'
//         . 'insert into textblock (type, text) values ('
//         . forSql(1) . ','
//         . forSql('Braune Biotonne rausstellen.', true) . ');'
//         . 'insert into textblock (type, text) values ('
//         . forSql(1) . ','
//         . forSql('Braune Biotonne reinstellen.', true) . ');';
    //*
    this.query({cmd: 'saveAppData', id: data.id, data: data.forBackend, usertype: data.usertype})
      .subscribe({
        next: (response: any) => {
          const ret = new AppData();
          ret.fillFromBackend(response.data);
          ret.usertype = response.usertype;
          onDone(ret);
        },
        error: error => {
          console.error(error);
          onError?.(error);
        }
      });
    // */
  }

  logout(): void {
    this.token = null;
    GLOBALS.appData = null;
    GLOBALS.currentPage = null;
    GLOBALS.currentUserType = null;
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
