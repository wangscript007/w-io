package com.wolf.javabean;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;

public class WioKeyThreadResult {

	private Object o = null;
	private BlockingQueue queue = null;
	
	public WioKeyThreadResult(BlockingQueue queue){
		this.queue = queue;
	}
	
	public WioKeyThreadResult getData() throws Exception{
		o = queue.poll(20, TimeUnit.SECONDS);
		//if(o == null){System.out.println("出现阻塞");}
		return this;
	}

	public Object getO() {
		return o;
	}

	public BlockingQueue getQueue() {
		return queue;
	}
}
