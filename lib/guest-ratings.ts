import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'node:crypto';
const cookieName='nyc-rating-visitor';
export async function guestRatingKey(create=false){
 const jar=await cookies();let token=jar.get(cookieName)?.value;
 if(!token||!/^[a-f0-9]{64}$/.test(token)){
  if(!create)return null;
  token=randomBytes(32).toString('hex');
  jar.set(cookieName,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*365});
 }
 return createHash('sha256').update(token).digest('hex');
}
