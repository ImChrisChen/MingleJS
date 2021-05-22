/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/4/14
 * Time: 5:54 下午
 */

const isLocal = window.location.origin.includes('.local.');

export const AMIS_DOMAIN: string = isLocal ? '//amis.local.superdalan.com' : '//amis.superdalan.com';
export const AUC_DOMAIN: string = isLocal ? '//auc.local.aidalan.com' : '//auc.aidalan.com';
export const MINGLE_DOMAIN: string = isLocal ? '//mingle.local.aidalan.com' : '//mingle.aidalan.com';
