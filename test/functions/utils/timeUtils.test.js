import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { TimeUtils } from '../../../functions/utils/timeUtils.js'; 
import { Timestamp } from 'firebase-admin/firestore';
import Moment from 'moment';
import MomentRange from "moment-range";
const moment = MomentRange.extendMoment(Moment);


describe('commonDateRanges', () => {
  it('should return common dates preferences between 2 users', () => {
    // simulates data stored in Firestore
    let datesPreferences = {
      a : {
        0: [
          // https://firebase.google.com/docs/reference/node/firebase.firestore.Timestamp
          new Timestamp(1689465600, 0), // 16 July 2023
          new Timestamp(1689984000,0)  // 22 July 2023
        ],
        1:[
          new Timestamp(1689811200, 0), // 20 July 2023
          new Timestamp(1690243200, 0)  // 25 July 2023
        ],
        2: [
          new Timestamp(1690761600, 0), // 31 July 2023
          new Timestamp(1690934400, 0) // 2 August 2023
        ]
      },
      b : {
        0: [
          new Timestamp(1689811200, 0), // 20 July 2023
          new Timestamp(1689897600, 0)  // 21 July 2023
        ]
      }
    };

    let expectedOutputArraySorted = [
      moment.range(
        new Timestamp(1689811200, 0).toDate(), // 20 July 2023
        new Timestamp(1689897600, 0).toDate() // 21 July 2023
      )
    ];

    let actualOutputArraySorted = new TimeUtils().commonDateRanges(datesPreferences);

    for (let i = 0; i < expectedOutputArraySorted.length; i++){
      assert(expectedOutputArraySorted[i].isEqual(actualOutputArraySorted[i]));
    }
  });

  it('should return 2 common dates preferences between 3 users', () => {
    // simulates data stored in Firestore
    let datesPreferences = {
      a : {
        0: [
          // https://firebase.google.com/docs/reference/node/firebase.firestore.Timestamp
          new Timestamp(1689465600, 0), // 16 July 2023
          new Timestamp(1689984000,0)  // 22 July 2023
        ],
        1:[
          new Timestamp(1689811200, 0), // 20 July 2023
          new Timestamp(1690243200, 0)  // 25 July 2023
        ],
        2: [
          new Timestamp(1690761600, 0), // 31 July 2023
          new Timestamp(1690934400, 0) // 2 August 2023
        ]
      },
      b : {
        0: [
          new Timestamp(1689811200, 0), // 20 July 2023
          new Timestamp(1689897600, 0)  // 21 July 2023
        ],
        1:[
          new Timestamp(1690934400, 0), // 2 August 2023
          new Timestamp(1690934400, 0) // 2 August 2023
        ]
      },
      c : {
        0: [
          new Timestamp(1689811200, 0), // 20 July 2023
          new Timestamp(1689811200, 0)  // 20 July 2023
        ],
        1:[
          new Timestamp(1690934400, 0), // 2 August 2023
          new Timestamp(1690934400, 0) // 2 August 2023
        ]
      }
    };

    let expectedOutputArraySorted = [
        moment.range(
          new Timestamp(1689811200, 0).toDate(), // 20 July 2023
          new Timestamp(1689811200, 0).toDate() // 20 July 2023
        ),
        moment.range(
          new Timestamp(1690934400, 0).toDate(), // 2 August 2023
          new Timestamp(1690934400, 0).toDate() // 2 August 2023
        )
    ];

    let actualOutputArraySorted = new TimeUtils().commonDateRanges(datesPreferences);

    for (let i = 0; i < expectedOutputArraySorted.length; i++){
      assert(expectedOutputArraySorted[i].isEqual(actualOutputArraySorted[i]));
    }
  });

  it('should return no common dates preferences', () => {
    // simulates data stored in Firestore
    let datesPreferences = {
      a : {
        0: [
          // https://firebase.google.com/docs/reference/node/firebase.firestore.Timestamp
          new Timestamp(1689465600, 0), // 16 July 2023
          new Timestamp(1689984000,0)  // 22 July 2023
        ],
        1:[
          new Timestamp(1689811200, 0), // 20 July 2023
          new Timestamp(1690243200, 0)  // 25 July 2023
        ]
      },
      b : {
        0: [
          new Timestamp(1690761600, 0), // 31 July 2023
          new Timestamp(1690761600, 0)  // 31 July 2023
        ]
      },
      c : {
        0: [
          new Timestamp(1690934400, 0), // 2 August 2023
          new Timestamp(1690934400, 0)  // 2 August 2023
        ]
      }
    };

    let expectedOutput = [];

    let actualCommonAvailabilities = new TimeUtils().commonDateRanges(datesPreferences);

    assert(expectedOutput.length == actualCommonAvailabilities.length);
  }); 
});

