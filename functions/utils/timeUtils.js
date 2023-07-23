import Moment from 'moment';
import MomentRange from "moment-range";

const moment = MomentRange.extendMoment(Moment);


export class TimeUtils{
    constructor(){
    }

    _getUIDRangesMap(datesPreferences){
        /* 
        datesPreferences: {<uid>: {0: [<start>, <end>]}}. Timestamp objects 
        returns: {<uid>: [<range>, <range>, ...]}
        */
        let uidRangesMap = {};

        for (const [uid, datesObj] of Object.entries(datesPreferences)) {
            for (const [index, startEndList] of Object.entries(datesObj)) {
                let range = moment.range(
                    startEndList[0].toDate(),
                    startEndList[1].toDate()
                );

                if (uid in uidRangesMap){
                    uidRangesMap[uid].push(range);
                } else {
                    uidRangesMap[uid] = [range];
                }
            }
        }
        return uidRangesMap;
    }

    commonDateRanges(datesPreferences){
        // datesPreferences: {<uid>: {0: [<start>, <end>]}}. Timestamp objects

        let uidRangesMap = this._getUIDRangesMap(datesPreferences);

        if(Object.keys(uidRangesMap).length == 1){
            for (const [uid, dateRangeList] of Object.entries(uidRangesMap)) {
                return dateRangeList;
            }
        }

        let commonAvailabilitiesCurrentVsAllOtherUsers = [];

        for (const [uid, dateRangeList] of Object.entries(uidRangesMap)) {
            // each date range of a given user needs to overlap with all other users

            for (const [comparingUid, comparingDateRangeList] of Object.entries(uidRangesMap)) {
                if ((uid !== comparingUid)){
                    let commonDatesBetweenTwoUsers = [];
                    for (let dateRange of dateRangeList) {
                        for (let comparingDateRange of comparingDateRangeList) {
                            let stringifiedDateStartDateRange = moment(dateRange.start).format("DD MMM YYYY");
                            let stringifiedDateEndDateRange = moment(dateRange.end).format("DD MMM YYYY");
                            if (stringifiedDateStartDateRange == stringifiedDateEndDateRange){
                                if(comparingDateRange.contains(dateRange, { excludeEnd: false,  excludeStart: false })){
                                    commonDatesBetweenTwoUsers.push(dateRange);
                                }
                            }
                            let stringifiedDateStartComparingDateRange = moment(comparingDateRange.start).format("DD MMM YYYY");
                            let stringifiedDateEndComparingDateRange = moment(comparingDateRange.end).format("DD MMM YYYY");
                            if (stringifiedDateStartComparingDateRange == stringifiedDateEndComparingDateRange){
                                if(dateRange.contains(comparingDateRange, { excludeEnd: false,  excludeStart: false })){
                                    commonDatesBetweenTwoUsers.push(comparingDateRange);
                                }
                            }
                            let rangeIntersect = dateRange.intersect(comparingDateRange);
                            if(rangeIntersect !== null){
                                commonDatesBetweenTwoUsers.push(rangeIntersect);
                            }
                            
                        }
                    }
                    if(commonDatesBetweenTwoUsers.length == 0){
                        return [];
                    }
                    if (commonAvailabilitiesCurrentVsAllOtherUsers.length == 0){
                        commonAvailabilitiesCurrentVsAllOtherUsers = commonDatesBetweenTwoUsers;
                    } else {
                        let overlapWithExistingAvailabilities = [];
                        for (let commonDateBetweenTwoUsers of commonDatesBetweenTwoUsers){
                            for (let commonAvailabilityCurrentVsAllOtherUsers of commonAvailabilitiesCurrentVsAllOtherUsers){
                                let stringifiedDateStart2users = moment(commonDateBetweenTwoUsers.start).format("DD MMM YYYY");
                                let stringifiedDateEnd2users = moment(commonDateBetweenTwoUsers.end).format("DD MMM YYYY");
                                if (stringifiedDateStart2users == stringifiedDateEnd2users){
                                    if(commonAvailabilityCurrentVsAllOtherUsers.contains(commonDateBetweenTwoUsers, { excludeEnd: false,  excludeStart: false })){
                                        overlapWithExistingAvailabilities.push(commonDateBetweenTwoUsers);
                                    }
                                }

                                let stringifiedDateStartAllusers = moment(commonAvailabilityCurrentVsAllOtherUsers.start).format("DD MMM YYYY");
                                let stringifiedDateEndAllusers = moment(commonAvailabilityCurrentVsAllOtherUsers.end).format("DD MMM YYYY");
                                if (stringifiedDateStartAllusers == stringifiedDateEndAllusers){
                                    if(commonDateBetweenTwoUsers.contains(commonAvailabilityCurrentVsAllOtherUsers, { excludeEnd: false,  excludeStart: false })){
                                        overlapWithExistingAvailabilities.push(commonAvailabilityCurrentVsAllOtherUsers);
                                    }
                                }

                                let overlap = commonDateBetweenTwoUsers.intersect(commonAvailabilityCurrentVsAllOtherUsers);
                                if (overlap != null){
                                    overlapWithExistingAvailabilities.push(overlap);
                                }
                            }
                        }
                        if (overlapWithExistingAvailabilities.length == 0){
                            return [];
                        } else {
                            commonAvailabilitiesCurrentVsAllOtherUsers = overlapWithExistingAvailabilities;
                        }
                    }
                }
            }
            break;
        }
        // remove duplicated ranges
        let uniqueRanges = [];
        let commonAvailabilitiesAmongAllStrings = new Set();

        for(let commonAvailabilityAmongAll of commonAvailabilitiesCurrentVsAllOtherUsers){
            let stringifiedDateStart = moment(commonAvailabilityAmongAll.start).format("DD MMM YYYY");
            let stringifiedDateEnd = moment(commonAvailabilityAmongAll.end).format("DD MMM YYYY");
            let stringifiedDateFormat = stringifiedDateStart + stringifiedDateEnd;

            if (!(commonAvailabilitiesAmongAllStrings.has(stringifiedDateFormat))){
                commonAvailabilitiesAmongAllStrings.add(stringifiedDateFormat);
                uniqueRanges.push(commonAvailabilityAmongAll);
            }
        }
        return uniqueRanges.sort();
    }

    getLengthsAndDateRanges(dateRanges){
        /* dateRanges: Set 
        returns: Map {<num days>: [<date range>, <date range>, ...]}
        */
        let numDaysDateRangeMap = {};
        
        for(let dateRange of dateRanges){
            let len = dateRange.end.diff(dateRange.start, 'days') + 1;

            if (numDaysDateRangeMap.has(len)){
                numDaysDateRangeMap[len].push(dateRange);
            } else {
                numDaysDateRangeMap[len] = [dateRange];
            }
        }
        return numDaysDateRangeMap;
    }
}