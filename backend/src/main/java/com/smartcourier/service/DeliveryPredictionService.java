package com.smartcourier.service;

import java.io.InputStream;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import weka.classifiers.trees.RandomForest;
import weka.core.DenseInstance;
import weka.core.Instances;
import weka.core.converters.CSVLoader;

@Service
public class DeliveryPredictionService {

	private RandomForest model;
	private Instances trainingData;

	public DeliveryPredictionService() {
		try {
			trainModel();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	// Train Random Forest model
	private void trainModel() throws Exception {

		ClassPathResource resource = new ClassPathResource("ml/delivery_data.csv");

		InputStream inputStream = resource.getInputStream();

		CSVLoader loader = new CSVLoader();
		loader.setSource(inputStream);

		trainingData = loader.getDataSet();

		// Last column = deliveryDays
		trainingData.setClassIndex(trainingData.numAttributes() - 1);

		model = new RandomForest();

		// Number of trees
		model.setNumIterations(100);

		// Train model
		model.buildClassifier(trainingData);

		System.out.println("===== ML MODEL TRAINED SUCCESSFULLY =====");
	}

	// Predict delivery days
	public double predictDeliveryDays(double weight, double distance, String deliveryType, double hubDelay)
			throws Exception {

		DenseInstance instance = new DenseInstance(trainingData.numAttributes());

		instance.setDataset(trainingData);

		instance.setValue(trainingData.attribute("weight"), weight);

		instance.setValue(trainingData.attribute("distance"), distance);

		instance.setValue(trainingData.attribute("deliveryType"), deliveryType);

		instance.setValue(trainingData.attribute("hubDelay"), hubDelay);

		double prediction = model.classifyInstance(instance);

		return prediction;
	}
}