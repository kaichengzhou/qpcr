angular
.module('FactCtrl', [])
.controller('FactController', function($scope,$http, FactService) {
    $scope.AddParameter = () => {
        var list = {
            TestGroup: Number($scope.TestGroup),
            TargetGene: Number($scope.TargetGene),
            Brep:Number($scope.Brep),
            Trep:Number($scope.Trep),
            GeneNames:getnames($scope.GeneNames)
        }
        $scope.list = list
        $scope.colWidth = []
        $scope.colWidth.push(1)
        $scope.definition = []
        $scope.definition.push("Mean Cp")
        var constDefi = ["Mean Cp", "Delta Cp", "Expression","Mean Expression", "Fold Expression"]
        for(var i=0; i<$scope.TargetGene;i++){
            var temp = $scope.definition.concat(constDefi)
            $scope.definition = temp
            $scope.colWidth.push(5)
        }
        $scope.Groups = []
        for(var i=0; i<list.TestGroup;i++){
            $scope.Groups[i] = {
                br:0,
                tr:0,
                name:" "
            }
        }
        var table = createTable(($scope.list.Brep * $scope.list.Trep), $scope.list.TargetGene)
        $scope.table = table
        console.log($scope.Groups)
    }

    $scope.AddGroups = () =>{
        var TestGroupTables = []
        for(var i = 0; i< $scope.Groups.length; i++){
            TestGroupTables[i] = []
            for(var a=0; a<($scope.Groups[i].br * $scope.Groups[i].tr);a++){
                TestGroupTables[i][a] = []
                for(var b=0;b<=$scope.list.TargetGene;b++)
                {
                    TestGroupTables[i][a][b] = 0
                }
            }
        }
        $scope.TestGroupTables = TestGroupTables
    }
    $scope.AddTable = function() 
    { 
     console.log($scope.table)
     console.log($scope.TestGroupTables)
     createResultTable()
     calculateQPCR()
 }
 createTable = (row, col) =>{
    var table = []
    for(var i=0; i<row;i++){
        table[i] = []
        for(var j=0;j<=col;j++)
        {
            table[i][j] = 0
        }
    }
    return table
}
createObjTable = (row, col) =>{
    var table = []
    for(var i=0; i<row;i++){
        table[i] = []
        for(var j=0;j<col;j++)
        {
            table[i][j] = {}
        }
    }
    return table
}
getnames = (str) => {
    var names = str.split(' ');
    return names
}
calculateQPCR = () =>{
    var counter = 0
    var sum = 0
    var trep = 0
        //get mean cp from control group
        for(var i = 0; i<=$scope.list.TargetGene;i++){
            counter = 0
            sum = 0
            trep = $scope.list.Trep
            for(var j=0; j< $scope.list.Brep* $scope.list.Trep; j++)
            {
                if(counter< $scope.list.Trep-1)
                {
                    sum += Number($scope.table[j][i])
                    if(Number($scope.table[j][i]) == 0)
                        trep--;
                    counter++
                }
                else{
                    sum += Number($scope.table[j][i])
                    if(Number($scope.table[j][i]) == 0)
                        trep--;
                    $scope.resultTable[0][((j+1)/$scope.list.Trep)-1][i].average = sum/trep
                    sum = 0
                    counter =0
                    trep = $scope.list.Trep
                }
            }
        }
        //get mean cp from test groups
        for(var i=0; i<$scope.TestGroupTables.length;i++)
        {
            for(var j=0; j<= $scope.list.TargetGene;j++){
                counter =0
                sum =0
                trep = $scope.Groups[i].tr
                for(var k=0;k<$scope.Groups[i].br * $scope.Groups[i].tr; k++)
                {
                    if(counter< $scope.Groups[i].tr-1)
                    {
                        sum += Number($scope.TestGroupTables[i][k][j])
                        if(Number($scope.TestGroupTables[i][k][j])==0)
                            trep--;
                        counter++
                    }
                    else{
                        sum += Number($scope.TestGroupTables[i][k][j])
                        if(Number($scope.TestGroupTables[i][k][j])==0)
                            trep--;
                        $scope.resultTable[i+1][((k+1)/$scope.Groups[i].tr)-1][j].average = sum/trep
                        sum = 0
                        counter =0
                        trep = $scope.Groups[i].tr;
                    }
                }
            }
        }
        //get delta cp
        for(var i=0; i<$scope.resultTable.length;i++)//for each table in the set
        {
            for(var j=1; j<= $scope.list.TargetGene;j++)// for each col in every row start from second col
            {
                for(var k=0;k<$scope.resultTable[i].length; k++)//for each row in table
                {
                    $scope.resultTable[i][k][j].deltaCP = $scope.resultTable[i][k][j].average - $scope.resultTable[i][k][0].average
                }
            }
        }
        //get expression
        for(var i=0; i<$scope.resultTable.length;i++)//for each table in the set
        {
            for(var j=1; j<= $scope.list.TargetGene;j++)// for each col in every row start from second col
            {
                for(var k=0;k<$scope.resultTable[i].length; k++)//for each row in table
                {
                    $scope.resultTable[i][k][j].expression = Math.pow(2, -Math.abs($scope.resultTable[i][k][j].deltaCP))
                }
            }
        }
        //get mean expression
        for(var i=0; i<$scope.resultTable.length;i++)//for each table in the set
        {
            for(var j=1; j<= $scope.list.TargetGene;j++)// for each col in every row start from second col
            {
                for(var k=0;k<$scope.resultTable[i].length; k++)//for each row in table
                {
                    $scope.resultTable[i][k][j].meanExpression = getMeanExpression(i,j)
                }
            }
        }
        //get fold expression
        for(var i=0; i<$scope.resultTable.length;i++)//for each table in the set
        {
            for(var j=1; j<= $scope.list.TargetGene;j++)// for each col in every row start from second col
            {
                for(var k=0;k<$scope.resultTable[i].length; k++)//for each row in table
                {
                    $scope.resultTable[i][k][j].foldExpression = $scope.resultTable[i][k][j].expression/$scope.resultTable[0][0][j].meanExpression
                }
            }
        }
        //group results in a row
        for(var i=0; i<$scope.resultTable.length;i++)//for each table in the set
        {
            for(var j=0; j< $scope.resultTable[i].length;j++)// for each row in table
            {
                var newDisplay = []
                for(var k=0;k< $scope.resultTable[i][j].length; k++)//for each row in table
                {
                    newDisplay.push($scope.resultTable[i][j][k].average);
                    if("deltaCP" in $scope.resultTable[i][j][k])
                    {
                        newDisplay.push($scope.resultTable[i][j][k].deltaCP);
                        newDisplay.push($scope.resultTable[i][j][k].expression);
                        newDisplay.push($scope.resultTable[i][j][k].meanExpression);
                        newDisplay.push($scope.resultTable[i][j][k].foldExpression);
                    }
                }
                console.log(newDisplay)
                $scope.resultTable[i][j] = newDisplay
            }
        }
    }
    totalBrep = () =>{
        var total = $scope.list.Brep
        for(var i=0; i< $scope.Groups.length;i++){
            total+=$scope.Groups[i].br
        }
        return total
    }
    createResultTable = () =>{
        $scope.resultTable = []
        $scope.resultTable[0] = createObjTable($scope.list.Brep, 1 + $scope.list.TargetGene)
        for(var i = 0; i<$scope.Groups.length;i++){
            $scope.resultTable[i+1] = createObjTable($scope.Groups[i].br, 1+$scope.list.TargetGene)
        }
    }
    getMeanExpression = (table,col) =>{
        var meanExpression = 0
        var sum = 0
        for(var i=0; i<$scope.resultTable[table].length;i++)
        {
            sum += $scope.resultTable[table][i][col].expression
        }
        meanExpression = sum/$scope.resultTable[table].length
        return meanExpression
    }
    $scope.exportData = function () {
        var blob = new Blob([document.getElementById('exportable').innerHTML], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        });
        saveAs(blob, "Report.xls");
    };
    $scope.showRowControl = function(row){
        if(row%$scope.list.Trep == 0){
            console.log("bingo" + row)
            return true;
        }
        else
            return false;
    };
    $scope.showRowTest = function(group,row){
        if(row%$scope.Groups[group].tr == 0){
            return true;
        } 
        else
            return false;
    };
})
