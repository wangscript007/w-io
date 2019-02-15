package com.wolf.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.ObjectInputStream;

public class MessageImpl implements MessageI<Object>{

	@Override
	public Object getDatas(byte[] bytes) {
		Object o = getObj(bytes);
		return o;
	}
	
	private Object getObj(byte[] bytes){
		ObjectInputStream ois = null;
		ByteArrayInputStream bais = null;
		try{
			bais = new ByteArrayInputStream(bytes);
			ois = new ObjectInputStream(bais);
			Object o = ois.readObject();
			return o;
		}catch(Exception e){
			e.printStackTrace();
			return null;
		}finally{
			try {
				if(ois != null){
					ois.close();
					ois = null;
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			try {
				if(bais != null){
					bais.close();
					bais = null;
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
	
}
