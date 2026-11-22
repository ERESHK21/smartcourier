package com.smartcourier.dto;

public class AnalyticsResponse {

	private long totalUsers;
	private long totalParcels;
	private long deliveredParcels;
	private long pendingParcels;
	private long totalAgents;
	private long availableAgents;
	private double totalRevenue;

	public AnalyticsResponse() {
	}

	public AnalyticsResponse(long totalUsers, long totalParcels, long deliveredParcels, long pendingParcels,
			long totalAgents, long availableAgents, double totalRevenue) {

		this.totalUsers = totalUsers;
		this.totalParcels = totalParcels;
		this.deliveredParcels = deliveredParcels;
		this.pendingParcels = pendingParcels;
		this.totalAgents = totalAgents;
		this.availableAgents = availableAgents;
		this.totalRevenue = totalRevenue;
	}

	public long getTotalUsers() {
		return totalUsers;
	}

	public void setTotalUsers(long totalUsers) {
		this.totalUsers = totalUsers;
	}

	public long getTotalParcels() {
		return totalParcels;
	}

	public void setTotalParcels(long totalParcels) {
		this.totalParcels = totalParcels;
	}

	public long getDeliveredParcels() {
		return deliveredParcels;
	}

	public void setDeliveredParcels(long deliveredParcels) {
		this.deliveredParcels = deliveredParcels;
	}

	public long getPendingParcels() {
		return pendingParcels;
	}

	public void setPendingParcels(long pendingParcels) {
		this.pendingParcels = pendingParcels;
	}

	public long getTotalAgents() {
		return totalAgents;
	}

	public void setTotalAgents(long totalAgents) {
		this.totalAgents = totalAgents;
	}

	public long getAvailableAgents() {
		return availableAgents;
	}

	public void setAvailableAgents(long availableAgents) {
		this.availableAgents = availableAgents;
	}

	public double getTotalRevenue() {
		return totalRevenue;
	}

	public void setTotalRevenue(double totalRevenue) {
		this.totalRevenue = totalRevenue;
	}
}