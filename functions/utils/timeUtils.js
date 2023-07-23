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
        let commonAvailabilitiesCurrentVsAllOtherUsers = [];

        for (const [uid, dateRangeList] of Object.entries(uidRangesMap)) {
            console.log("11111111111111111111111111 - uid: " + uid);
            // each date range of a given user needs to overlap with all other users

            for (const [comparingUid, comparingDateRangeList] of Object.entries(uidRangesMap)) {
                console.log("2222222222222222222222222222222222222 - comparingUid: " + comparingUid);
                if ((uid !== comparingUid)){
                    
                    let commonDatesBetweenTwoUsers = [];
                    for (let dateRange of dateRangeList) {
                        console.log("----------------------------------------");
                        for (let comparingDateRange of comparingDateRangeList) {
                            console.log("////////////////////////////////////////////");
                            console.log("comparing");
                            console.log(JSON.stringify(dateRange));
                            console.log(JSON.stringify(comparingDateRange));
                            let stringifiedDateStartDateRange = moment(dateRange.start).format("DD MMM YYYY");
                            let stringifiedDateEndDateRange = moment(dateRange.end).format("DD MMM YYYY");
                            console.log(stringifiedDateStartDateRange + " " + stringifiedDateEndDateRange);
                            if (stringifiedDateStartDateRange == stringifiedDateEndDateRange){
                                console.log("stringifiedDateStartDateRange == stringifiedDateEndDateRange");
                                if(comparingDateRange.contains(dateRange, { excludeEnd: false,  excludeStart: false })){
                                    console.log("comparingDateRange.contains(dateRange)");
                                    commonDatesBetweenTwoUsers.push(dateRange);
                                }
                            }
                            let stringifiedDateStartComparingDateRange = moment(comparingDateRange.start).format("DD MMM YYYY");
                            let stringifiedDateEndComparingDateRange = moment(comparingDateRange.end).format("DD MMM YYYY");
                            console.log(stringifiedDateStartComparingDateRange + " " + stringifiedDateEndComparingDateRange);
                            if (stringifiedDateStartComparingDateRange == stringifiedDateEndComparingDateRange){
                                console.log("(stringifiedDateStartComparingDateRange == stringifiedDateEndComparingDateRange)");
                                if(dateRange.contains(comparingDateRange, { excludeEnd: false,  excludeStart: false })){
                                    console.log("dateRange.contains(comparingDateRange)");
                                    commonDatesBetweenTwoUsers.push(comparingDateRange);
                                }
                            }
                            let rangeIntersect = dateRange.intersect(comparingDateRange);
                            console.log("intersection: ");
                            console.log(JSON.stringify(rangeIntersect));
                            if(rangeIntersect !== null){
                                commonDatesBetweenTwoUsers.push(rangeIntersect);
                            }
                            
                        }
                    }
                    if(commonDatesBetweenTwoUsers.length == 0){
                        return [];
                    }
                    console.log("333333333333333333333333333333");
                    console.log(commonDatesBetweenTwoUsers);
                    console.log(commonAvailabilitiesCurrentVsAllOtherUsers);
                    console.log(commonAvailabilitiesCurrentVsAllOtherUsers.length);
                    if (commonAvailabilitiesCurrentVsAllOtherUsers.length == 0){
                        console.log("commonAvailabilitiesCurrentVsAllOtherUsers.length == 0");
                        commonAvailabilitiesCurrentVsAllOtherUsers = commonDatesBetweenTwoUsers;
                    } else {
                        let overlapWithExistingAvailabilities = [];
                        for (let commonDateBetweenTwoUsers of commonDatesBetweenTwoUsers){
                            for (let commonAvailabilityCurrentVsAllOtherUsers of commonAvailabilitiesCurrentVsAllOtherUsers){
                                let stringifiedDateStart2users = moment(commonDateBetweenTwoUsers.start).format("DD MMM YYYY");
                                let stringifiedDateEnd2users = moment(commonDateBetweenTwoUsers.end).format("DD MMM YYYY");
                                if (stringifiedDateStart2users == stringifiedDateEnd2users){
                                    console.log("stringifiedDateStart2users == stringifiedDateEnd2users");
                                    if(commonAvailabilityCurrentVsAllOtherUsers.contains(commonDateBetweenTwoUsers, { excludeEnd: false,  excludeStart: false })){
                                        console.log("comparingDateRange.contains(dateRange)");
                                        overlapWithExistingAvailabilities.push(commonDateBetweenTwoUsers);
                                    }
                                }

                                let stringifiedDateStartAllusers = moment(commonAvailabilityCurrentVsAllOtherUsers.start).format("DD MMM YYYY");
                                let stringifiedDateEndAllusers = moment(commonAvailabilityCurrentVsAllOtherUsers.end).format("DD MMM YYYY");
                                if (stringifiedDateStartAllusers == stringifiedDateEndAllusers){
                                    console.log("stringifiedDateStart2users == stringifiedDateEnd2users");
                                    if(commonDateBetweenTwoUsers.contains(commonAvailabilityCurrentVsAllOtherUsers, { excludeEnd: false,  excludeStart: false })){
                                        console.log("comparingDateRange.contains(dateRange)");
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
                    console.log("4444444444444444444444444444444444444");
                    console.log(commonAvailabilitiesCurrentVsAllOtherUsers);
                }
            }
            break;
        }
        console.log("55555555555555555555555555555555555555555");
        console.log(JSON.stringify(commonAvailabilitiesCurrentVsAllOtherUsers));
        // remove duplicated ranges
        let uniqueRanges = [];
        let commonAvailabilitiesAmongAllStrings = new Set();

        for(let commonAvailabilityAmongAll of commonAvailabilitiesCurrentVsAllOtherUsers){
            console.log("666666666666666666666666666666")
            console.log(commonAvailabilityAmongAll);
            let stringifiedDateStart = moment(commonAvailabilityAmongAll.start).format("DD MMM YYYY");
            let stringifiedDateEnd = moment(commonAvailabilityAmongAll.end).format("DD MMM YYYY");
            let stringifiedDateFormat = stringifiedDateStart + stringifiedDateEnd;
            console.log("7777777777777777777777777777777777777")
            console.log(stringifiedDateFormat);

            if (!(commonAvailabilitiesAmongAllStrings.has(stringifiedDateFormat))){
                commonAvailabilitiesAmongAllStrings.add(stringifiedDateFormat);
                uniqueRanges.push(commonAvailabilityAmongAll);
            }
            console.log("88888888888888888888888888888888888888");
            console.log(commonAvailabilitiesAmongAllStrings);
            console.log("9999999999999999999999999999999999999");
            console.log(uniqueRanges);
        }

        console.log("100000000000000000000000000000000000000000");
        console.log(uniqueRanges);
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