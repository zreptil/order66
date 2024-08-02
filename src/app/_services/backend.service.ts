import {Injectable} from '@angular/core';
import {EnvironmentService} from '@/_services/environment.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Utils} from '@/classes/utils';
import {GLOBALS} from '@/_services/globals.service';
import {AppData} from '@/_model/app-data';
import {PersonData} from '@/_model/person-data';
import {PlanData} from '@/_model/plan-data';
import {UserData} from '@/_model/user-data';

export type SitterPlan = { ui: number, ai: number, pi: number, p: PlanData };

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

  changePassword(pwdOld: string, pwdNew: string, onDone: () => void, onError?: (error: any) => void): void {
    Utils.hash(pwdOld).then((hashOld: string) => {
      Utils.hash(pwdNew).then((hashNew: string) => {
        this.query({cmd: 'changePwd', po: hashOld, pn: hashNew}, this.token)
          .subscribe({
            next: _response => {
              onDone?.();
            },
            error: error => {
              if (error.error.ec === 404) {
                error = $localize`Old password is wrong`;
              } else {
                error = error.error.em;
              }
              onError?.(error);
            }
          });
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

  saveSitterPlan(plan: SitterPlan, onDone: (data: SitterPlan) => void, onError?: (error: any) => void): void {
    this.query({cmd: 'loadAppData', id: 1, userid: plan.ui}).subscribe({
      next: (response: any) => {
        const appData = new AppData();
        appData.fillFromBackend(response.data);
        if (appData.plans?.length < plan.pi) {
          onError?.(`error when loading appData of user ${plan.ui}`);
          return;
        }
        appData.plans[plan.pi] = plan.p;
        this.query({cmd: 'saveAppData', userid: plan.ui, id: appData.id, data: appData.forBackend, usertype: appData.usertype})
          .subscribe({
            next: (response: any) => {
              const ret = new AppData();
              ret.fillFromBackend(response.data);
              ret.usertype = response.usertype;
              plan.p = ret.plans[plan.pi];
              onDone(plan);
            },
            error: error => {
              console.error(error);
              onError?.(error);
            }
          });
      },
      error: error => {
        console.error(error);
        onError?.(error);
      }
    });
  }

  getSitterPlans(onDone: (data: SitterPlan[]) => void, onError?: (error: any) => void) {
    // get all appData from all owners
    this.query({cmd: 'loadOwnerData'})
      .subscribe({
        next: (response: any) => {
          const ret: SitterPlan[] = [];
          // response contains
          // data: list of {d: {id: appData-Id, data: appData}, u: userId of appData)
          // ui: user id of the current user
          for (const src of JSON.parse(response.data)) {
            const appData = new AppData();
            appData.fillFromBackend(src.d.data);
            // now get all plans of the appData where
            // the sitter is the current user
            if (appData.plans != null) {
              let idx = 0;
              for (const plan of appData.plans) {
                if (plan.sitter === response.ui) {
                  ret.push({
                    ui: response.ui,
                    ai: src.d.id,
                    pi: idx,
                    p: plan
                  });
                }
                idx++;
              }
            }
          }
          onDone(ret);
        },
        error: error => {
          console.error(error);
          onError?.(error);
        }
      });
  }

  loadUserList(onDone: (data: UserData[]) => void, onError?: (error: any) => void): void {
    this.query({cmd: 'loadUserList'})
      .subscribe({
        next: (response: any) => {
          const ret: UserData[] = [];
          for (const src of response) {
            ret.push(new UserData(src));
          }
          onDone(ret);
        },
        error: error => {
          console.error(error);
          onError?.(error);
        }
      });
  }

  loadAppData(onDone: (data: AppData) => void, onError?: (error: any) => void): void {
    this.query({cmd: 'loadAppData', id: 1})
      .subscribe({
        next: (response: any) => {
          const ret = new AppData();
          ret.fillFromBackend(response.data);
          ret.permissions = response.perm.split(',').map((entry: string) => +entry);
          onDone(ret);
        },
        error: error => {
          console.error(error);
          onError?.(error);
        }
      });
  }

  saveUser(data: UserData, onError?: (error: any) => void): void {
    this.query({cmd: 'saveUser', id: data.id, data: data.forBackend})
      .subscribe({
        next: (_response: any) => {
        },
        error: error => {
          console.error(error);
          onError?.(error);
        }
      });
  }

  saveAppData(data: AppData, onDone: (data: AppData) => void, onError?: (error: any) => void): void {
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
