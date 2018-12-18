import { CancelToken, post } from 'axios';
// import { postData } from '../config/testpost';
import { checkValidObject } from './utilitys';

const apiEndpoint = 'https://lg0njzoglg.execute-api.us-east-1.amazonaws.com/';
const zonalStatsPath = 'Prod/zonal_stats';

const maxAttempts = 3;

/** API Wrapper Service Class
* this wraps the lambda service into axios js calls
* it should only handle the api calls
*/
export class ZonalStatsAPI {
  constructor(url = apiEndpoint, path = zonalStatsPath) {
    this.url = url + path;
    this.cancelToken = CancelToken.source();
  }

  makeConfigObj(postdata) {
    // make sure we have post data don't bother sending anything if we don't
    if (!checkValidObject(postdata)) {
      return { baddata: postdata };
    }

    this.cancelToken.cancel('Cancelled Ongoing Request');
    this.cancelToken = CancelToken.source();
    const axiosConfig = {
      cancelToken: this.cancelToken.token,
      headers: {
        'content-type': 'text/plain'
      }
    };
    
    return axiosConfig
 }

  // async httPut() {
  //   this.cancelToken.cancel('Cancelled Ongoing Request');
  //   this.cancelToken = CancelToken.source();
  //   const axiosConfig = {
  //     cancelToken: this.cancelToken.token,
  //     headers: {
  //       'content-type': 'text/plain'
  //     }
  //   };
  //
  //   try {
  //     const response = await puy(this.url, postData, axiosConfig);
  //     console.log(response.data);
  //     return response.data.features[0].mean;
  //   } catch (err) {
  //     console.log(err)
  //     return {};
  //   }
  // }


  async getZonalStatsSummary(postdata) {
    const axiosConfig = this.makeConfigObj(postdata);
    const success = false;
    let numAttempts = 0;
    while (numAttempts < maxAttempts) {
      try {
        const response = await post(this.url, postdata, axiosConfig);
        if (response.status === 200 && response.data) {
          return response.data; // features[0].mean;
        } else {
          throw new Error();
        }
      } catch (err) {
        numAttempts += 1;
      }
    }
    // We've tried three times with no success. Throw an error with a message to the user.
    throw new Error("Something went wrong. Please try again."); 
  }
}

