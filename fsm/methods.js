/* 
	Definition of events, which triggers state transitions
	01 CargoInitiatedByUser 	|	02 CargoCancelledByUser
	03 OrderRejectedByShop 		|	04 OrderAcceptanceTimeout
	05 OrderAcceptedByShop 		|	06 OrderDespatchedByShop
	07 TransitIgnoredByAgent	|	08 TransitAcceptanceTimeout
	09 TransitAcceptedByAgent 	|	10 TransitRejectedByAgent
	11 TranistCompleteByAgent 	|	
*/

// User s

/*
	#Method 			:  01
	Start/End(States) 	: 
	User 				: 
	Agent				: 
	Shop				: 
	Admin				: 
*/
const CargoInitiatedByUser			=  function()
{

}

/*
	#Method 			:  02
	Start/End(States) 	: 
	User 				: 
	Agent				: 
	Shop				: 
	Admin				: 
*/
const CargoCancelledByUser			=  function()
{

}


// Shop s

/*
	#Method 			:  03
	Start/End(States) 	: 
	User 				: 
	Agent				: 
	Shop				: 
	Admin				: 
*/
const OrderRejectedByShop			=  function()
{

}

/*
	#Method 			:  04
	Start/End(States) 	: 
	User 				: 
	Agent				: 
	Shop				: 
	Admin				: 
*/
const OrderAcceptanceTimeout		=  function()
{

}

/*
	#Method 			:  05
	Start/End(States) 	: 
	User 				: 
	Agent				: 
	Shop				: 
	Admin				: 
*/
const OrderAcceptedByShop			=  function()
{

}

/*
	#Method 			:  06
	Start/End(States) 	: 
	User 				: 
	Agent				: 
	Shop				: 
	Admin				: 
*/
const OrderDespatchedByShop		=  function()
{

}


// Agent s

/*
	#Method 			:  07
	Start/End(States) 	: 
	User 				: 
	Agent				: 
	Shop				: 
	Admin				: 
*/
const TransitIgnoredByAgent		=  function()
{

}

/*
	#Method 			:  08
	Start/End(States) 	: 
	User 				: 
	Agent				: 
	Shop				: 
	Admin				: 
*/
const TransitAcceptanceTimeout		=  function()
{

}

/*
	#Method 			:  09
	Start/End(States) 	: 
	User 				: 
	Agent				: 
	Shop				: 
	Admin				: 
*/
const TransitAcceptedByAgent		=  function()
{

}

/*
	#Method 			:  10
	Start/End(States) 	: 
	User 				: 
	Agent				: 
	Shop				: 
	Admin				: 
*/
const TransitRejectedByAgent		=  function()
{

}

/*
	#Method 			:  11
	Start/End(States) 	: 
	User 				: 
	Agent				: 
	Shop				: 
	Admin				: 
*/
const TranistCompleteByAgent		=  function()
{

}

module.exports = 
{
	CargoInitiatedByUser		: CargoInitiatedByUser,
	CargoCancelledByUser		: CargoCancelledByUser,
	OrderRejectedByShop			: OrderRejectedByShop,
	OrderAcceptanceTimeout		: OrderAcceptanceTimeout,
	OrderAcceptedByShop			: OrderAcceptedByShop,
	OrderDespatchedByShop		: OrderDespatchedByShop,
	TransitIgnoredByAgent		: TransitIgnoredByAgent,
	TransitAcceptanceTimeout	: TransitAcceptanceTimeout,
	TransitAcceptedByAgent		: TransitAcceptedByAgent,
	TransitRejectedByAgent		: TransitRejectedByAgent,
	TranistCompleteByAgent		: TranistCompleteByAgent
}