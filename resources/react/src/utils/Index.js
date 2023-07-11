import { MdCusg } from "../master/md/MdCusg"
import { MdCusj } from "../master/md/MdCusj"
import { MdCusm } from "../master/md/MdCusm"
import { MdCust } from "../master/md/MdCust"
import { MdGudg } from "../master/md/MdGudg"
import { MdGudl } from "../master/md/MdGudl"
import { MdGudt } from "../master/md/MdGudt"
import { MdSupj } from "../master/md/MdSupj"
import { MdSupl } from "../master/md/MdSupl"

import { MpBahg } from "../master/mp/MpBahg"
import { MpBahj } from "../master/mp/MpBahj"
import { MpBahn } from "../master/mp/MpBahn"
import { MpCatg } from "../master/mp/MpCatg"
import { MpCatn } from '../master/mp/MpCatn'
import { MpCats } from '../master/mp/MpCats'
import { MpColc } from "../master/mp/MpColc"
import { MpProd } from "../master/mp/MpProd"
import { MpDisc } from "../master/mp/MpDisc"
import { MpRegl } from '../master/mp/MpRegl'
import { MpVarj } from '../master/mp/MpVarj'
import { MpVars } from '../master/mp/MpVars'

import { MrAttr } from "../master/mr/MrAttr"
import { MrKota } from "../master/mr/MrKota"
import { MrKotp } from "../master/mr/MrKotp"
import { MrMerk } from "../master/mr/MrMerk"
import { MrPack } from "../master/mr/MrPack"
import { MrRack } from "../master/mr/MrRack"
import { MrSatn } from "../master/mr/MrSatn"

import { SyGrup } from "../master/sy/SyGrup"
import { SyUser } from "../master/sy/SyUser"
import { SyParm } from "../master/sy/SyParm"

import { BtIvpo } from "../master/bt/BtIvpo"

import { TrivGr } from "../transaksi/iv/TrivGr"
import { TrivPo } from "../transaksi/iv/TrivPo"
import { TrivPw } from "../transaksi/iv/TrivPw"
import { TrivDs } from "../transaksi/iv/TrivDs"

import { RsGudg } from "../report/rs/RsGudg"
import { RiMutg } from "../report/rs/RiMutg"

const Components = {
    'mdcusg': MdCusg, 'mdcusj': MdCusj, 'mdcusm': MdCusm, 'mdcust': MdCust, 'mdgudg': MdGudg, 'mdgudl': MdGudl, 'mdgudt': MdGudt, 'mdsupj': MdSupj, 'mdsupl': MdSupl,
    'mpbahg': MpBahg, 'mpbahj': MpBahj, 'mpbahn': MpBahn, 'mpcatg': MpCatg, 'mpcatn': MpCatn, 'mpcats': MpCats, 'mpcolc': MpColc, 'mpprod': MpProd, 'mpdisc': MpDisc, 'mpregl': MpRegl, 'mpvarj': MpVarj, 'mpvars': MpVars,
    'mrattr': MrAttr, 'mrkota': MrKota, 'mrkotp': MrKotp, 'mrmerk': MrMerk, 'mrpack': MrPack, 'mrrack': MrRack, 'mrsatn': MrSatn,
    'sygrup': SyGrup, 'syparm': SyParm, 'syuser': SyUser,
    'btivpo': BtIvpo,
    'trivgr': TrivGr, 'trivpo': TrivPo, 'trivpoapv': TrivPo, 'trivpw': TrivPw, 'trivds': TrivDs,
    'rsgudg': RsGudg, 'rimutg': RiMutg
}

import { GModal } from "./GModal"
import { GListEdit } from "./GListEdit"
import { GModalList } from './GModalList'
import { GInputNumber } from "./GInputNumber"
import { GInputDate } from "./GInputDate"
import { GInputSkuV1 } from "./GInputSkuV1"
import { GReportV1 } from "./GReportV1"
import { GFormEdit } from "./GFormEdit"

// const URL_API = 'http://192.168.8.19:84/api/'
const URL_API = 'http://localhost:8000/api/'

const numberFormat = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});


export {GFormEdit, GInputNumber, GModal, GModalList, GListEdit, GInputDate, GInputSkuV1, GReportV1, URL_API, Components, numberFormat}